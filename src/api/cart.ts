import {
    apiGet,
    apiPost,
    apiPut,
    apiDelete,
} from "./api";

// ==================== TYPES ====================

export interface CartItem {
    id: number | string;
    book_id: number;
    quantity: number;
    title?: string;
    image?: string;
    mrp?: number | string;
    discount_amount?: number | string;
    selling_price?: number | string;
    price?: number | string;
    subtotal?: number | string;
    [key: string]: unknown;
}

export interface Cart {
    items: CartItem[];
    total_items?: number;
    grand_total?: number;
    success?: boolean;
    [key: string]: unknown;
}

export interface DeliveryAddress {
    id: number;
    full_name: string;
    phone: string;
    address_line_1: string;
    address_line_2?: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    is_default?: boolean;
}

interface ApiObject {
    [key: string]: unknown;
}

// ==================== HELPERS ====================

function asObject(value: unknown): ApiObject {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        return value as ApiObject;
    }

    return {};
}

function asArray<T>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
}

/**
 * Handles responses such as:
 * { success: true, items: [...] }
 * { results: [...] }
 * { data: { items: [...] } }
 * { data: [...] }
 */
function getResponseData(response: unknown): unknown {
    const root = asObject(response);

    if (root.data !== undefined && root.data !== null) {
        return root.data;
    }

    return response;
}

// ==================== CART APIs ====================

// GET /api/cart/
export async function getCart(): Promise<Cart> {
    const response = await apiGet<unknown>("cart/");

    const root = asObject(response);
    const data = asObject(getResponseData(response));

    let rawItems: unknown;

    if (Array.isArray(response)) {
        rawItems = response;
    } else if (Array.isArray(root.items)) {
        rawItems = root.items;
    } else if (Array.isArray(root.results)) {
        rawItems = root.results;
    } else if (Array.isArray(data.items)) {
        rawItems = data.items;
    } else if (Array.isArray(data.results)) {
        rawItems = data.results;
    } else if (Array.isArray(getResponseData(response))) {
        rawItems = getResponseData(response);
    } else {
        rawItems = [];
    }

    const items = asArray<CartItem>(rawItems);

    const totalItems = Number(
        data.total_items ??
        root.total_items ??
        items.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0,
        ),
    );

    const grandTotal = Number(
        data.grand_total ??
        root.grand_total ??
        items.reduce((total, item) => {
            const subtotal = Number(item.subtotal);

            if (item.subtotal !== undefined && Number.isFinite(subtotal)) {
                return total + subtotal;
            }

            return (
                total +
                Number(item.selling_price ?? item.price ?? 0) *
                    Number(item.quantity ?? 0)
            );
        }, 0),
    );

    return {
        ...root,
        ...data,
        items,
        total_items: Number.isFinite(totalItems) ? totalItems : 0,
        grand_total: Number.isFinite(grandTotal) ? grandTotal : 0,
    };
}

// PUT /api/cart/update/{cartId}/
export async function updateCartItem(
    cartId: number | string,
    quantity: number,
): Promise<unknown> {
    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Quantity must be at least 1.");
    }

    return apiPut(
        `cart/update/${encodeURIComponent(String(cartId))}/`,
        { quantity },
    );
}

// DELETE /api/cart/remove/{cartId}/
export async function removeCartItem(
    cartId: number | string,
): Promise<unknown> {
    return apiDelete(
        `cart/remove/${encodeURIComponent(String(cartId))}/`,
    );
}

// ==================== ADDRESS APIs ====================

// GET /api/addresses/
export async function getAddresses(): Promise<DeliveryAddress[]> {
    const response = await apiGet<unknown>("addresses/");

    if (Array.isArray(response)) {
        return response as DeliveryAddress[];
    }

    const root = asObject(response);
    const data = getResponseData(response);

    if (Array.isArray(root.results)) {
        return root.results as DeliveryAddress[];
    }

    if (Array.isArray(root.addresses)) {
        return root.addresses as DeliveryAddress[];
    }

    if (Array.isArray(data)) {
        return data as DeliveryAddress[];
    }

    const nested = asObject(data);

    if (Array.isArray(nested.results)) {
        return nested.results as DeliveryAddress[];
    }

    if (Array.isArray(nested.addresses)) {
        return nested.addresses as DeliveryAddress[];
    }

    return [];
}

// ==================== ORDER APIs ====================

// POST /api/orders/create/
export async function createOrder(
    addressId: number,
): Promise<unknown> {
    if (!Number.isFinite(addressId)) {
        throw new Error("A valid delivery address is required.");
    }

    return apiPost("orders/create/", {
        address_id: addressId,
    });
}

// POST /api/orders/razorpay/create/
export async function createRazorpayOrder(
    orderId: number | string,
): Promise<unknown> {
    return apiPost("orders/razorpay/create/", {
        order_id: orderId,
    });
}

// POST /api/orders/verify-payment/
export async function verifyPayment(payload: {
    order_id: number | string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}): Promise<unknown> {
    return apiPost("orders/verify-payment/", payload);
}
