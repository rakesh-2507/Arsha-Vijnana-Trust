import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    LoaderCircle,
    Minus,
    Plus,
    ShieldCheck,
    ShoppingBag,
    Trash2,
    Truck,
    X,
    MapPin,
    PackageCheck,
    RefreshCw,
} from "lucide-react";

import {
    createOrder,
    createRazorpayOrder,
    getAddresses,
    getCart,
    removeCartItem,
    updateCartItem,
    verifyPayment,
} from "../api/cart";

import type { CartItem, DeliveryAddress } from "../api/cart";

interface RazorpayResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    order_id: string;
    name: string;
    description: string;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme?: { color: string };
    handler: (response: RazorpayResponse) => void | Promise<void>;
    modal?: {
        ondismiss?: () => void;
    };
}

interface RazorpayInstance {
    open: () => void;
}

declare global {
    interface Window {
        Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

interface ApiObject {
    [key: string]: unknown;
}

function asObject(value: unknown): ApiObject {
    if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    ) {
        return value as ApiObject;
    }

    return {};
}

function money(value: unknown): string {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
}

function itemPrice(item: CartItem): number {
    return Number(item.selling_price ?? item.price ?? 0) || 0;
}

function itemSubtotal(item: CartItem): number {
    const subtotal = Number(item.subtotal);

    if (
        item.subtotal !== undefined &&
        item.subtotal !== null &&
        Number.isFinite(subtotal)
    ) {
        return subtotal;
    }

    return itemPrice(item) * Number(item.quantity ?? 0);
}

function getOrderId(response: unknown): number | string | null {
    const root = asObject(response);
    const data = asObject(root.data);
    const order = asObject(data.order);

    const candidates = [data.id, data.order_id, root.id, root.order_id, order.id];

    return (
        (candidates.find(
            (value) =>
                (typeof value === "string" && value.length > 0) ||
                (typeof value === "number" && Number.isFinite(value)),
        ) as number | string | undefined) ?? null
    );
}

function loadRazorpayScript(): Promise<boolean> {
    if (window.Razorpay) {
        return Promise.resolve(true);
    }

    return new Promise((resolve) => {
        const existing = document.querySelector<HTMLScriptElement>(
            'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
        );

        if (existing) {
            if (existing.dataset.loaded === "true") {
                resolve(Boolean(window.Razorpay));
                return;
            }

            existing.addEventListener(
                "load",
                () => resolve(Boolean(window.Razorpay)),
                { once: true },
            );

            existing.addEventListener(
                "error",
                () => resolve(false),
                { once: true },
            );

            return;
        }

        const script = document.createElement("script");

        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;

        script.onload = () => {
            script.dataset.loaded = "true";
            resolve(Boolean(window.Razorpay));
        };

        script.onerror = () => resolve(false);

        document.body.appendChild(script);
    });
}

export default function CartPage() {
    const navigate = useNavigate();

    const [items, setItems] = useState<CartItem[]>([]);
    const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] =
        useState<number | null>(null);

    const [loading, setLoading] = useState(true);
    const [addressLoading, setAddressLoading] = useState(false);
    const [busyItemId, setBusyItemId] =
        useState<number | string | null>(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [addressModalOpen, setAddressModalOpen] = useState(false);

    const [error, setError] = useState("");
    const [checkoutError, setCheckoutError] = useState("");

    const loadCart = useCallback(async (showLoader = true) => {
        if (showLoader) {
            setLoading(true);
        }

        setError("");

        try {
            const cart = await getCart();

            setItems(Array.isArray(cart.items) ? cart.items : []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load your cart.",
            );
        } finally {
            setLoading(false);
        }
    }, []);

useEffect(() => {
    const token =
        localStorage.getItem("access_token") ??
        localStorage.getItem("token");

    if (!token) {
        navigate("/");
        return;
    }

    void Promise.resolve().then(() => {
        void loadCart();
    });
}, [navigate, loadCart]);

    const totalQuantity = useMemo(
        () =>
            items.reduce(
                (sum, item) => sum + Number(item.quantity || 0),
                0,
            ),
        [items],
    );

    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + itemSubtotal(item), 0),
        [items],
    );

    const changeQuantity = async (
        item: CartItem,
        quantity: number,
    ): Promise<void> => {
        if (quantity < 1 || busyItemId !== null) {
            return;
        }

        setBusyItemId(item.id);
        setError("");

        try {
            await updateCartItem(item.id, quantity);
            await loadCart(false);
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to update item quantity.",
            );
        } finally {
            setBusyItemId(null);
        }
    };

    const deleteItem = async (item: CartItem): Promise<void> => {
        if (busyItemId !== null) {
            return;
        }

        const confirmed = window.confirm(
            `Remove "${item.title ?? "this book"}" from your cart?`,
        );

        if (!confirmed) {
            return;
        }

        setBusyItemId(item.id);
        setError("");

        try {
            await removeCartItem(item.id);
            await loadCart(false);
            window.dispatchEvent(new Event("cartUpdated"));
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to remove this item.",
            );
        } finally {
            setBusyItemId(null);
        }
    };

    const openCheckout = async (): Promise<void> => {
        setCheckoutError("");
        setAddressLoading(true);
        setAddressModalOpen(true);

        try {
            const result = await getAddresses();
            const validAddresses = Array.isArray(result) ? result : [];

            setAddresses(validAddresses);

            setSelectedAddressId((current) => {
                if (
                    current !== null &&
                    validAddresses.some((address) => address.id === current)
                ) {
                    return current;
                }

                const defaultAddress = validAddresses.find(
                    (address) => address.is_default,
                );

                return defaultAddress?.id ?? validAddresses[0]?.id ?? null;
            });
        } catch (err) {
            setAddresses([]);
            setSelectedAddressId(null);

            setCheckoutError(
                err instanceof Error
                    ? err.message
                    : "Unable to load delivery addresses.",
            );
        } finally {
            setAddressLoading(false);
        }
    };

    const startPayment = async (): Promise<void> => {
        if (selectedAddressId === null) {
            setCheckoutError("Please select a delivery address.");
            return;
        }

        if (checkoutLoading) {
            return;
        }

        setCheckoutLoading(true);
        setCheckoutError("");

        try {
            const createdOrder = await createOrder(selectedAddressId);
            const orderId = getOrderId(createdOrder);

            if (orderId === null) {
                throw new Error(
                    "The order response did not contain an order ID. Check your orders before trying again.",
                );
            }

            const razorpayResponse = await createRazorpayOrder(orderId);
            const root = asObject(razorpayResponse);
            const data = asObject(root.data);
            const paymentData =
                Object.keys(data).length > 0 ? data : root;

            const key = paymentData.key;
            const amount = paymentData.amount;
            const currency = paymentData.currency ?? "INR";
            const razorpayOrderId = paymentData.razorpay_order_id;

            if (
                typeof key !== "string" ||
                typeof razorpayOrderId !== "string" ||
                amount === undefined ||
                !Number.isFinite(Number(amount))
            ) {
                throw new Error(
                    "The payment response is missing the Razorpay key, amount, or payment order ID. Please check the API response.",
                );
            }

            const loaded = await loadRazorpayScript();

            if (!loaded || !window.Razorpay) {
                throw new Error(
                    "Unable to load Razorpay checkout. Check your internet connection and try again.",
                );
            }

            const paymentOptions: RazorpayOptions = {
                key,
                amount: Number(amount),
                currency: String(currency),
                order_id: razorpayOrderId,
                name: "Arsha Vijnana Trust",
                description: "Book Purchase",
                prefill: {
                    name:
                        typeof paymentData.customer_name === "string"
                            ? paymentData.customer_name
                            : undefined,
                    email:
                        typeof paymentData.email === "string"
                            ? paymentData.email
                            : undefined,
                    contact:
                        typeof paymentData.phone === "string"
                            ? paymentData.phone
                            : undefined,
                },
                theme: {
                    color: "#ff6b35",
                },
                handler: async (payment: RazorpayResponse) => {
                    try {
                        await verifyPayment({
                            order_id: orderId,
                            razorpay_order_id: payment.razorpay_order_id,
                            razorpay_payment_id: payment.razorpay_payment_id,
                            razorpay_signature: payment.razorpay_signature,
                        });

                        window.dispatchEvent(new Event("cartUpdated"));
                        setAddressModalOpen(false);

                        navigate(
                            `/order-success?order_id=${encodeURIComponent(
                                String(orderId),
                            )}`,
                        );
                    } catch (err) {
                        setCheckoutError(
                            err instanceof Error
                                ? `Payment verification failed: ${err.message}`
                                : "Payment verification failed. Contact support before retrying.",
                        );
                    } finally {
                        setCheckoutLoading(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setCheckoutLoading(false);
                    },
                },
            };

            const razorpay = new window.Razorpay(paymentOptions);
            razorpay.open();
        } catch (err) {
            setCheckoutError(
                err instanceof Error
                    ? err.message
                    : "Unable to start checkout. Please try again.",
            );

            setCheckoutLoading(false);
        }
    };


    return (
        <main className="min-h-screen bg-orange-50/30 py-8 text-gray-800 sm:py-12">
            <div className="mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page heading */}
                <div className="mb-8 sm:mb-10">
                    <Link
                        to="/store"
                        className="mb-5 inline-flex items-center gap-2 rounded-full text-sm font-semibold text-orange-700 transition hover:text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-4"
                    >
                        <ArrowLeft size={17} />
                        Continue shopping
                    </Link>

                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
                                <ShoppingBag size={15} />
                                Your collection
                            </div>

                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                                Shopping Cart
                                {!loading && (
                                    <span className="ml-3 inline-flex min-w-9 items-center justify-center rounded-full bg-orange-100 px-3 py-1 align-middle text-base font-bold text-orange-700">
                                        {totalQuantity}
                                    </span>
                                )}
                            </h1>

                            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                                Review your selected books and get ready to
                                bring home a little more wisdom.
                            </p>
                        </div>

                        {!loading && items.length > 0 && (
                            <div className="inline-flex items-center gap-2 self-start rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm sm:self-auto">
                                <PackageCheck
                                    size={17}
                                    className="text-orange-600"
                                />
                                {items.length}{" "}
                                {items.length === 1 ? "book" : "different books"}
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <div className="flex items-start gap-3">
                            <RefreshCw
                                size={18}
                                className="mt-0.5 shrink-0"
                            />
                            <span>{error}</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => void loadCart()}
                            className="shrink-0 rounded-lg px-2 py-1 font-semibold underline underline-offset-2 hover:text-red-900"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-orange-100 bg-white shadow-sm">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
                            <LoaderCircle
                                className="animate-spin text-orange-600"
                                size={30}
                            />
                        </div>

                        <p className="mt-5 font-semibold text-gray-800">
                            Loading your cart
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Getting your books ready...
                        </p>
                    </div>
                ) : items.length === 0 ? (
                    <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
                        <div className="h-2 bg-gradient-to-r from-orange-300 via-orange-500 to-orange-300" />

                        <div className="flex flex-col items-center px-5 py-16 text-center sm:px-10 sm:py-20">
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-orange-50 ring-8 ring-orange-50/60">
                                <ShoppingBag
                                    size={42}
                                    strokeWidth={1.5}
                                    className="text-orange-600"
                                />
                            </div>

                            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                                A fresh chapter awaits
                            </p>

                            <h2 className="mt-3 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                                Your cart is empty
                            </h2>

                            <p className="mt-3 max-w-md text-sm leading-7 text-gray-500 sm:text-base">
                                Discover timeless teachings and inspiring
                                stories. Find your next favourite book and
                                add it to your collection.
                            </p>

                            <Link
                                to="/store"
                                className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-200"
                            >
                                <BookOpen size={19} />
                                Explore Books
                                <ArrowLeft
                                    size={17}
                                    className="rotate-180"
                                />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3 lg:gap-8">
                        <section className="space-y-4 lg:col-span-2">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-lg font-bold text-gray-900">
                                    Your books
                                </h2>

                                <span className="text-sm text-gray-500">
                                    {totalQuantity}{" "}
                                    {totalQuantity === 1 ? "item" : "items"}
                                </span>
                            </div>

                            {items.map((item) => {
                                const price = itemPrice(item);
                                const busy = busyItemId === item.id;
                                const quantity = Number(item.quantity) || 0;
                                const hasDiscount =
                                    item.mrp !== undefined &&
                                    Number(item.mrp) > price;

                                return (
                                    <article
                                        key={item.id}
                                        className="group overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm transition duration-200 hover:border-orange-200 hover:shadow-md sm:p-5"
                                    >
                                        <div className="flex gap-4 sm:gap-5">
                                            <Link
                                                to={`/store/${item.book_id}`}
                                                aria-label={`View ${item.title ?? "book"} details`}
                                                className="flex h-32 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-orange-50/50 transition hover:border-orange-200 sm:h-40 sm:w-28"
                                            >
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={
                                                            item.title ??
                                                            "Book cover"
                                                        }
                                                        className="h-full w-full object-contain p-1 transition duration-300 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <BookOpen
                                                        size={34}
                                                        strokeWidth={1.4}
                                                        className="text-orange-300"
                                                    />
                                                )}
                                            </Link>

                                            <div className="flex min-w-0 flex-1 flex-col">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <Link
                                                            to={`/store/${item.book_id}`}
                                                            className="line-clamp-2 text-base font-bold leading-6 text-gray-900 transition hover:text-orange-700 sm:text-lg"
                                                        >
                                                            {item.title ??
                                                                `Book #${item.book_id}`}
                                                        </Link>

                                                        <p className="mt-1.5 text-xs text-gray-500">
                                                            Arsha Vijnana Trust
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        onClick={() =>
                                                            void deleteItem(item)
                                                        }
                                                        aria-label={`Remove ${item.title ?? "book"} from cart`}
                                                        title="Remove from cart"
                                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        {busy ? (
                                                            <LoaderCircle
                                                                size={18}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Trash2 size={18} />
                                                        )}
                                                    </button>
                                                </div>

                                                <div className="mt-3 flex flex-wrap items-baseline gap-2">
                                                    <span className="text-lg font-extrabold text-orange-700 sm:text-xl">
                                                        {money(price)}
                                                    </span>

                                                    {hasDiscount && (
                                                        <span className="text-sm text-gray-400 line-through">
                                                            {money(item.mrp)}
                                                        </span>
                                                    )}

                                                    {hasDiscount && (
                                                        <span className="rounded-md bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">
                                                            Save{" "}
                                                            {Math.round(
                                                                ((Number(item.mrp) -
                                                                    price) /
                                                                    Number(item.mrp)) *
                                                                    100,
                                                            )}
                                                            %
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                                                    <div className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1">
                                                        <button
                                                            type="button"
                                                            disabled={
                                                                busy ||
                                                                quantity <= 1
                                                            }
                                                            onClick={() =>
                                                                void changeQuantity(
                                                                    item,
                                                                    quantity - 1,
                                                                )
                                                            }
                                                            aria-label="Decrease quantity"
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-orange-100 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-35"
                                                        >
                                                            <Minus size={15} />
                                                        </button>

                                                        <span className="flex min-w-9 items-center justify-center px-1 text-sm font-bold tabular-nums text-gray-900">
                                                            {busy ? (
                                                                <LoaderCircle
                                                                    size={15}
                                                                    className="animate-spin text-orange-600"
                                                                />
                                                            ) : (
                                                                quantity
                                                            )}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            disabled={busy}
                                                            onClick={() =>
                                                                void changeQuantity(
                                                                    item,
                                                                    quantity + 1,
                                                                )
                                                            }
                                                            aria-label="Increase quantity"
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-orange-100 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-35"
                                                        >
                                                            <Plus size={15} />
                                                        </button>
                                                    </div>

                                                    <span className="text-xs font-medium text-gray-500">
                                                        {quantity} ×{" "}
                                                        {money(price)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-dashed border-gray-200 pt-4">
                                            <span className="text-sm text-gray-500">
                                                Item total
                                            </span>

                                            <span className="text-base font-extrabold text-gray-900">
                                                {money(itemSubtotal(item))}
                                            </span>
                                        </div>
                                    </article>
                                );
                            })}

                            <Link
                                to="/store"
                                className="inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-semibold text-orange-700 transition hover:text-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
                            >
                                <ArrowLeft size={17} />
                                Add more books
                            </Link>
                        </section>

                        <aside className="lg:sticky lg:top-24">
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div className="border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white px-5 py-5 sm:px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                                            <ShoppingBag size={21} />
                                        </div>

                                        <div>
                                            <h2 className="text-lg font-extrabold text-gray-900">
                                                Order Summary
                                            </h2>
                                            <p className="mt-0.5 text-xs text-gray-500">
                                                Review before checkout
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 sm:p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between gap-4 text-sm">
                                            <span className="text-gray-500">
                                                Items subtotal
                                            </span>
                                            <span className="font-semibold text-gray-900">
                                                {money(subtotal)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-4 text-sm">
                                            <span className="flex items-center gap-2 text-gray-500">
                                                <Truck
                                                    size={16}
                                                    className="text-orange-600"
                                                />
                                                Shipping
                                            </span>
                                            <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-bold text-green-700">
                                                FREE
                                            </span>
                                        </div>

                                        <div className="border-t border-dashed border-gray-200 pt-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="font-bold text-gray-900">
                                                    Total
                                                </span>

                                                <span className="text-2xl font-extrabold tracking-tight text-orange-700">
                                                    {money(subtotal)}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-xs leading-5 text-gray-500">
                                                Final payable amount is
                                                confirmed during checkout.
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => void openCheckout()}
                                        disabled={
                                            checkoutLoading ||
                                            addressLoading ||
                                            items.length === 0
                                        }
                                        className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-orange-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition duration-200 hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                                    >
                                        {addressLoading || checkoutLoading ? (
                                            <LoaderCircle
                                                size={19}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <ShieldCheck size={19} />
                                        )}
                                        Proceed to Checkout
                                    </button>

                                    <div className="mt-4 flex items-start gap-3 rounded-xl border border-orange-100 bg-orange-50/60 p-3">
                                        <MapPin
                                            size={18}
                                            className="mt-0.5 shrink-0 text-orange-600"
                                        />
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">
                                                Delivery address
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-gray-500">
                                                Choose your preferred delivery
                                                address in the next step.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center justify-center gap-2 text-xs text-gray-500">
                                        <ShieldCheck
                                            size={15}
                                            className="text-green-600"
                                        />
                                        Secure payment powered by Razorpay
                                    </div>

                                    <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-400">
                                        <CheckCircle2 size={14} />
                                        Your order is processed securely
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>

            {addressModalOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/60 p-3 backdrop-blur-sm sm:p-5"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !checkoutLoading &&
                            !addressLoading
                        ) {
                            setAddressModalOpen(false);
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="address-modal-title"
                        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl shadow-black/20 sm:rounded-3xl"
                    >
                        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-orange-100 bg-white px-5 py-5 sm:px-7 sm:py-6">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                                    <Truck size={22} />
                                </div>

                                <div>
                                    <h2
                                        id="address-modal-title"
                                        className="text-lg font-extrabold text-gray-900 sm:text-xl"
                                    >
                                        Select Delivery Address
                                    </h2>

                                    <p className="mt-1 text-sm leading-5 text-gray-500">
                                        Where should we deliver your books?
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setAddressModalOpen(false)}
                                disabled={
                                    checkoutLoading || addressLoading
                                }
                                aria-label="Close address selection"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 px-5 py-5 sm:px-7 sm:py-6">
                            {checkoutError && (
                                <div
                                    role="alert"
                                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
                                >
                                    <span className="font-semibold">
                                        Please note:
                                    </span>
                                    <span className="min-w-0 flex-1 break-words">
                                        {checkoutError}
                                    </span>
                                    <button
                                        type="button"
                                        aria-label="Dismiss message"
                                        onClick={() => setCheckoutError("")}
                                        className="shrink-0 rounded p-0.5 hover:bg-red-100"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            {addressLoading ? (
                                <div className="flex min-h-56 flex-col items-center justify-center">
                                    <LoaderCircle
                                        size={30}
                                        className="animate-spin text-orange-600"
                                    />
                                    <p className="mt-4 text-sm font-semibold text-gray-700">
                                        Loading your addresses...
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Please wait a moment.
                                    </p>
                                </div>
                            ) : addresses.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/40 px-5 py-10 text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                                        <MapPin size={29} />
                                    </div>

                                    <h3 className="mt-5 text-lg font-bold text-gray-900">
                                        No delivery addresses found
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                        Add a delivery address to your profile
                                        before proceeding with your purchase.
                                    </p>

                                    <Link
                                        to="/profile"
                                        onClick={() =>
                                            setAddressModalOpen(false)
                                        }
                                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200"
                                    >
                                        <Plus size={17} />
                                        Add an Address
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-bold text-gray-800">
                                            Saved addresses
                                        </p>
                                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                                            {addresses.length}{" "}
                                            {addresses.length === 1
                                                ? "address"
                                                : "addresses"}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        {addresses.map((address) => {
                                            const selected =
                                                selectedAddressId ===
                                                address.id;

                                            return (
                                                <label
                                                    key={address.id}
                                                    className={`block cursor-pointer rounded-2xl border p-4 transition duration-200 sm:p-5 ${
                                                        selected
                                                            ? "border-orange-500 bg-orange-50/70 ring-2 ring-orange-100"
                                                            : "border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/30"
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3.5">
                                                        <input
                                                            type="radio"
                                                            name="deliveryAddress"
                                                            checked={selected}
                                                            onChange={() =>
                                                                setSelectedAddressId(
                                                                    address.id,
                                                                )
                                                            }
                                                            className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-orange-600 focus:ring-orange-500"
                                                        />

                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="font-bold text-gray-900">
                                                                    {
                                                                        address.full_name
                                                                    }
                                                                </span>

                                                                {address.is_default && (
                                                                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-700">
                                                                        Default
                                                                    </span>
                                                                )}

                                                                {selected && (
                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-700">
                                                                        <CheckCircle2
                                                                            size={
                                                                                12
                                                                            }
                                                                        />
                                                                        Selected
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <p className="mt-2 text-sm font-medium text-gray-600">
                                                                {
                                                                    address.phone
                                                                }
                                                            </p>

                                                            <p className="mt-3 text-sm leading-6 text-gray-700">
                                                                {
                                                                    address.address_line_1
                                                                }
                                                                {address.address_line_2
                                                                    ? `, ${address.address_line_2}`
                                                                    : ""}
                                                            </p>

                                                            <p className="text-sm leading-6 text-gray-600">
                                                                {
                                                                    address.city
                                                                }
                                                                ,{" "}
                                                                {address.state}
                                                                ,{" "}
                                                                {address.country}
                                                                {" - "}
                                                                {
                                                                    address.postal_code
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-gray-100 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7 sm:py-5">
                            <button
                                type="button"
                                disabled={checkoutLoading || addressLoading}
                                onClick={() => setAddressModalOpen(false)}
                                className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={
                                    addressLoading ||
                                    checkoutLoading ||
                                    addresses.length === 0 ||
                                    selectedAddressId === null
                                }
                                onClick={() => void startPayment()}
                                className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-orange-600/15 transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {checkoutLoading ? (
                                    <LoaderCircle
                                        size={18}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <ShieldCheck size={18} />
                                )}
                                {checkoutLoading
                                    ? "Processing..."
                                    : "Continue to Payment"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </main>
    );
}
