
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  LoaderCircle,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import {
  cancelOrder,
  downloadOrderInvoice,
  getOrderDetails,
} from "../api/orders";

import type {
  OrderAddress,
  OrderDetails,
  OrderItem,
} from "../api/orders";

function formatCurrency(value: unknown): string {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value?: string): string {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatus(status?: string) {
  const normalized = (status ?? "PENDING").toUpperCase().trim();

  if (["DELIVERED", "COMPLETED", "SUCCESS", "PAID"].includes(normalized)) {
    return {
      label: normalized === "PAID" ? "Payment successful" : "Delivered",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      icon: CheckCircle2,
      description: "Your order has been completed successfully.",
    };
  }

  if (
    ["CANCELLED", "CANCELED", "REJECTED", "FAILED", "REFUNDED"].includes(
      normalized,
    )
  ) {
    return {
      label:
        normalized === "CANCELLED" || normalized === "CANCELED"
          ? "Cancelled"
          : normalized === "REJECTED"
            ? "Rejected"
            : normalized === "REFUNDED"
              ? "Refunded"
              : "Failed",
      className: "bg-red-50 text-red-700 ring-red-200",
      icon: XCircle,
      description: "This order is no longer being processed.",
    };
  }

  if (["SHIPPED", "OUT_FOR_DELIVERY", "DISPATCHED"].includes(normalized)) {
    return {
      label:
        normalized === "OUT_FOR_DELIVERY" ? "Out for delivery" : "Shipped",
      className: "bg-blue-50 text-blue-700 ring-blue-200",
      icon: Truck,
      description: "Your order is on its way.",
    };
  }

  if (["PROCESSING", "CONFIRMED", "ACCEPTED"].includes(normalized)) {
    return {
      label: "Processing",
      className: "bg-orange-50 text-orange-700 ring-orange-200",
      icon: Package,
      description: "Your order is being prepared.",
    };
  }

  return {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    icon: Clock3,
    description: "Your order is awaiting confirmation.",
  };
}

function getItemTitle(item: OrderItem): string {
  return item.title ?? item.name ?? "Book";
}

function getItemImage(item: OrderItem): string | null {
  return item.image ?? item.image_url ?? null;
}

function getItemPrice(item: OrderItem): number {
  return Number(item.price ?? 0) || 0;
}

function getItemQuantity(item: OrderItem): number {
  return Math.max(0, Number(item.quantity ?? 1) || 1);
}

function getItemSubtotal(item: OrderItem): number {
  if (item.subtotal !== undefined && item.subtotal !== null) {
    return Number(item.subtotal) || 0;
  }

  return getItemPrice(item) * getItemQuantity(item);
}

function getAddressLines(
  address: OrderAddress | string | null | undefined,
): string[] {
  if (!address) return [];

  if (typeof address === "string") return [address];

  const name = address.full_name ?? address.name;
  const line1 = address.address_line_1 ?? address.address;
  const line2 = address.address_line_2;
  const city = address.city;
  const state = address.state;
  const postalCode = address.postal_code ?? address.pincode;
  const country = address.country;
  const phone = address.phone;

  return [
    name,
    line1,
    line2,
    [city, state, postalCode].filter(Boolean).join(", "),
    country,
    phone ? `Phone: ${phone}` : undefined,
  ].filter((line): line is string => Boolean(line));
}

function OrderDetailsPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order_id") ?? searchParams.get("id");

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const loadOrder = useCallback(async (isRefresh = false) => {
    if (!orderId) {
      setError("Order ID is missing from the URL.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");
    setActionError("");

    try {
      const result = await getOrderDetails(orderId);
      setOrder(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load order details.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orderId]);

useEffect(() => {
  let cancelled = false;

  const fetchOrder = async () => {
    if (!orderId) {
      setError("Order ID is missing from the URL.");
      setLoading(false);
      return;
    }

    try {
      setError("");
      const result = await getOrderDetails(orderId);

      if (!cancelled) {
        setOrder(result);
      }
    } catch (err) {
      if (!cancelled) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load order details.",
        );
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  void fetchOrder();

  return () => {
    cancelled = true;
  };
}, [orderId]);

  const handleCancelOrder = async () => {
    if (!order) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) return;

    setCancelling(true);
    setActionError("");

    try {
      await cancelOrder(order.id);
      await loadOrder(true);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to cancel this order.",
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;

    setDownloading(true);
    setActionError("");

    try {
      const { blob, filename } = await downloadOrderInvoice(order.id);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Unable to download invoice.",
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <LoaderCircle className="h-9 w-9 animate-spin text-orange-600" />
          <p className="text-sm text-gray-500">Loading order details...</p>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />

          <h1 className="text-xl font-bold text-gray-900">
            Unable to load order
          </h1>

          <p className="mt-2 break-words text-sm text-gray-600">
            {error || "Order details could not be found."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => void loadOrder()}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>

            <Link
              to="/orders"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
            >
              <ArrowLeft className="h-4 w-4" />
              My orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const status = getStatus(order.status);
  const StatusIcon = status.icon;
  const items = Array.isArray(order.items) ? order.items : [];

  const subtotal =
    order.subtotal !== undefined && order.subtotal !== null
      ? Number(order.subtotal) || 0
      : items.reduce((sum, item) => sum + getItemSubtotal(item), 0);

  const shippingCharge = Number(order.shipping_charge ?? 0) || 0;
  const tax = Number(order.tax ?? 0) || 0;

  const total =
    order.total !== undefined && order.total !== null
      ? Number(order.total) || 0
      : subtotal + shippingCharge + tax;

  const normalizedStatus = (order.status ?? "PENDING").toUpperCase().trim();
  const canCancel = normalizedStatus === "PENDING";

  const addressLines = getAddressLines(
    order.shipping_address as OrderAddress | string | null | undefined,
  );

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/orders"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-orange-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to my orders
        </Link>

        {/* Order status header */}
        <section className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
          <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50/70 via-white to-amber-50/50 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Order details
                </div>

                <h1 className="break-words text-2xl font-bold text-gray-900 sm:text-3xl">
                  Order #{order.order_number ?? order.id}
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadOrder(true)}
                disabled={refreshing}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh status
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-orange-100 bg-white/80 p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ring-1 ${status.className}`}
                >
                  <StatusIcon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ring-1 ${status.className}`}
                  >
                    {status.label}
                  </span>

                  <p className="mt-2 text-sm text-gray-600">
                    {status.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="p-6 sm:p-8">
            <div className="mb-5 flex items-center gap-2">
              <Package className="h-5 w-5 text-orange-600" />

              <h2 className="text-lg font-bold text-gray-900">
                Items in your order
              </h2>

              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                {items.length}
              </span>
            </div>

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50/30 p-8 text-center">
                <Package className="mx-auto mb-3 h-8 w-8 text-orange-400" />
                <p className="text-sm text-gray-500">
                  No item details were returned for this order.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-orange-100">
                {items.map((item, index) => {
                  const image = getItemImage(item);

                  return (
                    <div
                      key={item.id ?? item.product_id ?? item.book_id ?? index}
                      className="flex gap-4 py-5 first:pt-0 last:pb-0"
                    >
                      <div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-orange-100 bg-orange-50/50">
                        {image ? (
                          <img
                            src={image}
                            alt={getItemTitle(item)}
                            className="h-full w-full object-contain"
                            loading="lazy"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-orange-300" />
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <h3 className="font-semibold leading-6 text-gray-900">
                          {getItemTitle(item)}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Quantity: {getItemQuantity(item)}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          Unit price: {formatCurrency(getItemPrice(item))}
                        </p>
                      </div>

                      <div className="shrink-0 self-center text-right">
                        <p className="font-bold text-gray-900">
                          {formatCurrency(getItemSubtotal(item))}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment summary */}
          <div className="border-t border-orange-100 bg-gradient-to-br from-orange-50/60 to-white p-6 sm:p-8">
            <h2 className="mb-5 text-lg font-bold text-gray-900">
              Payment summary
            </h2>

            <div className="ml-auto max-w-md space-y-3">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-900">
                  {shippingCharge === 0
                    ? "Free"
                    : formatCurrency(shippingCharge)}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(tax)}
                </span>
              </div>

              <div className="border-t border-orange-200 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-base font-bold text-gray-900">
                    Total paid / payable
                  </span>

                  <span className="text-xl font-bold text-orange-700">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {typeof order.payment_method === "string" &&
                order.payment_method && (
                  <div className="flex justify-between gap-4 pt-1 text-sm">
                    <span className="text-gray-600">Payment method</span>
                    <span className="text-right font-medium text-gray-900">
                      {order.payment_method}
                    </span>
                  </div>
                )}

              {typeof order.payment_status === "string" &&
                order.payment_status && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-600">Payment status</span>
                    <span className="text-right font-medium text-gray-900">
                      {order.payment_status}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </section>

        {/* Delivery information */}
        <section className="mt-6 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-600" />

            <h2 className="text-lg font-bold text-gray-900">
              Delivery information
            </h2>
          </div>

          {addressLines.length > 0 ? (
            <div className="mt-4 space-y-1 text-sm leading-6 text-gray-600">
              {addressLines.map((line, index) => (
                <p key={`${line}-${index}`}>{line}</p>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              No delivery address was included in the order details.
            </p>
          )}
        </section>

        {/* Actions */}
        <section className="mt-6 rounded-2xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />

            <div>
              <h2 className="font-bold text-gray-900">Order assistance</h2>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                You can refresh the latest order status or download your invoice
                if it is available.
              </p>
            </div>
          </div>

          {actionError && (
            <div
              role="alert"
              className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {actionError}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => void handleDownloadInvoice()}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}

              {downloading ? "Downloading..." : "Download invoice"}
            </button>

            {canCancel && (
              <button
                type="button"
                onClick={() => void handleCancelOrder()}
                disabled={cancelling}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelling && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}

                {cancelling ? "Cancelling..." : "Cancel order"}
              </button>
            )}

            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-200 px-5 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-orange-100"
            >
              <ArrowLeft className="h-4 w-4" />
              All orders
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default OrderDetailsPage;
