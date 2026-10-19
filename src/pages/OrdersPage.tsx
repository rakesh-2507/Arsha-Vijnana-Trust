import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    BookOpen,
    CalendarDays,
    CheckCircle2,
    Clock,
    LoaderCircle,
    Package,
    ShoppingBag,
    XCircle,
} from "lucide-react";

import { apiGet } from "../api/api";

interface OrderItem {
    id?: number | string;
    book_id?: number | string;
    title?: string;
    name?: string;
    image?: string;
    quantity?: number;
    price?: number | string;
    subtotal?: number | string;
}

interface Order {
    id: number | string;
    order_number?: string;
    status?: string;
    total?: number | string;
    created_at?: string;
    item_count?: number;
    items?: OrderItem[];
}

interface OrdersResponse {
    results?: Order[];
    data?: Order[] | { results?: Order[] };
    orders?: Order[];
}

function getOrders(data: unknown): Order[] {
    if (Array.isArray(data)) {
        return data as Order[];
    }

    if (!data || typeof data !== "object") {
        return [];
    }

    const response = data as OrdersResponse;

    if (Array.isArray(response.results)) {
        return response.results;
    }

    if (Array.isArray(response.orders)) {
        return response.orders;
    }

    if (Array.isArray(response.data)) {
        return response.data;
    }

    if (
        response.data &&
        typeof response.data === "object" &&
        Array.isArray(response.data.results)
    ) {
        return response.data.results;
    }

    return [];
}

function formatPrice(value: number | string | undefined) {
    return `₹${Number(value ?? 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatDate(value?: string) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getStatus(status?: string) {
    switch (status?.toUpperCase()) {
        case "PAID":
            return {
                label: "Paid",
                className: "bg-green-50 text-green-700 ring-green-600/20",
                icon: CheckCircle2,
            };

        case "PENDING":
            return {
                label: "Pending",
                className: "bg-amber-50 text-amber-700 ring-amber-600/20",
                icon: Clock,
            };

        case "CANCELLED":
            return {
                label: "Cancelled",
                className: "bg-red-50 text-red-700 ring-red-600/20",
                icon: XCircle,
            };

        case "FAILED":
            return {
                label: "Failed",
                className: "bg-red-50 text-red-700 ring-red-600/20",
                icon: AlertCircle,
            };

        default:
            return {
                label: status || "Unknown",
                className: "bg-gray-100 text-gray-700 ring-gray-500/20",
                icon: Package,
            };
    }
}

function OrdersPage() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadOrders() {
            const token =
                localStorage.getItem("access_token") ??
                localStorage.getItem("token");

            if (!token) {
                navigate("/", { replace: true });
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await apiGet<unknown>("orders/");

                if (cancelled) return;

                setOrders(getOrders(response));
            } catch (err: unknown) {
                if (cancelled) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load your orders. Please try again.",
                );
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadOrders();

        return () => {
            cancelled = true;
        };
    }, [navigate]);

    if (loading) {
        return (
            <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-gray-50 px-4">
                <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-gray-500">
                    Loading your orders...
                </p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
                <AlertCircle className="h-12 w-12 text-red-500" />

                <h1 className="mt-4 text-2xl font-bold text-gray-900">
                    Unable to load orders
                </h1>

                <p className="mt-2 max-w-md text-sm text-gray-500">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                    Try Again
                </button>
            </section>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Page heading */}
            <section className="border-b border-orange-100 bg-orange-50/70">
                <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link to="/" className="transition hover:text-primary">
                            Home
                        </Link>
                        <span>/</span>
                        <span className="font-semibold text-primary">
                            My Orders
                        </span>
                    </div>

                    <div className="mt-5 flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                            <ShoppingBag className="h-7 w-7" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                My Orders
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                View your purchases and order history.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {orders.length === 0 ? (
                    <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-50">
                            <BookOpen className="h-10 w-10 text-primary" />
                        </div>

                        <h2 className="mt-5 text-xl font-bold text-gray-900">
                            No orders found
                        </h2>

                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                            You haven't placed any orders yet. Explore our
                            collection and find your next favorite book.
                        </p>

                        <Link
                            to="/store"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            Explore Books
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    Order History
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    {orders.length}{" "}
                                    {orders.length === 1 ? "order" : "orders"}{" "}
                                    found
                                </p>
                            </div>

                            <Link
                                to="/store"
                                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:opacity-75"
                            >
                                Continue Shopping
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="space-y-5">
                            {orders.map((order) => {
                                const status = getStatus(order.status);
                                const StatusIcon = status.icon;
                                const items = order.items ?? [];

                                const itemCount =
                                    order.item_count ??
                                    items.reduce(
                                        (total, item) =>
                                            total + Number(item.quantity ?? 1),
                                        0,
                                    );

                                return (
                                    <article
                                        key={order.id}
                                        className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-200 hover:border-orange-200 hover:shadow-md"
                                    >
                                        {/* Order header */}
                                        <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50/70 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                    Order ID
                                                </p>

                                                <h3 className="mt-1 text-base font-bold text-gray-900">
                                                    {order.order_number ||
                                                        `#${order.id}`}
                                                </h3>

                                                <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                                    <CalendarDays className="h-4 w-4 text-primary" />
                                                    {formatDate(order.created_at)}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between gap-4 sm:justify-end">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold ring-1 ring-inset ${status.className}`}
                                                >
                                                    <StatusIcon className="h-4 w-4" />
                                                    {status.label}
                                                </span>

                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">
                                                        Order Total
                                                    </p>
                                                    <p className="mt-1 text-lg font-bold text-primary">
                                                        {formatPrice(order.total)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order items */}
                                        <div className="p-4 sm:p-6">
                                            {items.length === 0 ? (
                                                <p className="text-sm text-gray-500">
                                                    Item details are unavailable
                                                    for this order.
                                                </p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {items.map((item, index) => (
                                                        <div
                                                            key={
                                                                item.id ??
                                                                `${order.id}-${item.book_id ?? index}`
                                                            }
                                                            className="flex items-start gap-4"
                                                        >
                                                            <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-100 bg-orange-50/60 p-2 sm:h-28 sm:w-24">
                                                                {item.image ? (
                                                                    <img
                                                                        src={item.image}
                                                                        alt={
                                                                            item.title ??
                                                                            item.name ??
                                                                            "Book"
                                                                        }
                                                                        loading="lazy"
                                                                        className="h-full w-full object-contain"
                                                                    />
                                                                ) : (
                                                                    <BookOpen className="h-10 w-10 text-orange-200" />
                                                                )}
                                                            </div>

                                                            <div className="min-w-0 flex-1">
                                                                <h4 className="line-clamp-2 font-bold leading-6 text-gray-900">
                                                                    {item.title ??
                                                                        item.name ??
                                                                        "Book"}
                                                                </h4>

                                                                <p className="mt-2 text-sm text-gray-500">
                                                                    Quantity:{" "}
                                                                    {item.quantity ?? 1}
                                                                </p>

                                                                <p className="mt-1 text-sm text-gray-500">
                                                                    Price:{" "}
                                                                    {formatPrice(item.price)}
                                                                </p>
                                                            </div>

                                                            <div className="shrink-0 text-right">
                                                                <p className="text-xs text-gray-500">
                                                                    Subtotal
                                                                </p>
                                                                <p className="mt-1 text-sm font-bold text-gray-900 sm:text-base">
                                                                    {formatPrice(
                                                                        item.subtotal,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                                                <p className="text-sm text-gray-500">
                                                    Total items:{" "}
                                                    <span className="font-semibold text-gray-800">
                                                        {itemCount}
                                                    </span>
                                                </p>

                                                <Link
                                                    to={`/order-success?order_id=${encodeURIComponent(String(order.id))}`}
                                                    className="inline-flex items-center gap-2 rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-orange-50"
                                                >
                                                    View Order
                                                    <ArrowRight className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    </>
                )}

                <div className="mt-8">
                    <Link
                        to="/store"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-primary"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Store
                    </Link>
                </div>
            </section>
        </main>
    );
}

export default OrdersPage;
