
import { API_BASE_URL, apiGet, apiPost } from "./api";

export interface OrderItem {
  id?: number | string;
  product_id?: number | string;
  book_id?: number | string;
  title?: string;
  name?: string;
  image?: string | null;
  image_url?: string | null;
  quantity?: number;
  price?: number | string;
  subtotal?: number | string;
  [key: string]: unknown;
}

export interface OrderAddress {
  name?: string;
  full_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  pincode?: string;
  country?: string;
  [key: string]: unknown;
}

export interface OrderDetails {
  id: number | string;
  order_number?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
  subtotal?: number | string;
  shipping_charge?: number | string;
  tax?: number | string;
  total?: number | string;
  shipping_address?: OrderAddress | string | null;
  billing_address?: OrderAddress | string | null;
  payment_method?: string;
  payment_status?: string;
  [key: string]: unknown;
}

interface OrderApiResponse {
  data?: OrderDetails;
  order?: OrderDetails;
  message?: string;
  id?: number | string;
  [key: string]: unknown;
}

/**
 * Get order details.
 * GET /orders/{orderId}/
 */
export async function getOrderDetails(
  orderId: number | string,
): Promise<OrderDetails> {
  const response = await apiGet<OrderApiResponse>(
    `orders/${encodeURIComponent(String(orderId))}/`,
  );

  const order = response.data ?? response.order ?? response;

  if (order.id === undefined || order.id === null) {
    throw new Error("Order details were not found in the API response.");
  }

  return order as OrderDetails;
}

/**
 * Cancel an order.
 * POST /orders/{orderId}/cancel/
 */
export function cancelOrder(
  orderId: number | string,
): Promise<unknown> {
  return apiPost<unknown>(
    `orders/${encodeURIComponent(String(orderId))}/cancel/`,
  );
}

/**
 * Download an order invoice.
 * GET /orders/{orderId}/invoice/
 */
export async function downloadOrderInvoice(
  orderId: number | string,
): Promise<{ blob: Blob; filename: string }> {
  const token =
    localStorage.getItem("access_token") ??
    localStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/orders/${encodeURIComponent(String(orderId))}/invoice/`,
    {
      method: "GET",
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Failed to download the invoice.");
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition");

  let filename = `invoice-${orderId}.pdf`;

  const filenameMatch = disposition?.match(
    /filename\*?=(?:UTF-8''|")?([^";\n]+)/i,
  );

  if (filenameMatch?.[1]) {
    try {
      filename = decodeURIComponent(
        filenameMatch[1].replace(/"$/g, "").trim(),
      );
    } catch {
      filename = filenameMatch[1].replace(/"$/g, "").trim();
    }
  }

  return { blob, filename };
}
