
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    BookOpen,
    Check,
    ChevronRight,
    CircleHelp,
    LoaderCircle,
    Minus,
    Plus,
    ShoppingBag,
    Star,
    UserRound,
    X,
} from "lucide-react";

import { getBooks, getBookById } from "../api/books";
import type { Book } from "../api/books";
import { apiGet, apiPost } from "../api/api";
import LoginModal from "../components/auth/LoginModal";
import RegisterModal from "../components/auth/RegisterModal";

interface Author {
    id?: number;
    name: string;
    image?: string;
    biography?: string;
    [key: string]: unknown;
}

interface Review {
    id?: number | string;
    name?: string;
    rating?: number;
    review?: string;
    created_at?: string;
}

interface BookDetails extends Book {
    authors?: Author[];
    short_description?: string;
    publisher?: string;
    publication_year?: number | string;
    pages?: number | string;
    isbn?: string;
    stock?: number;
}

type AuthModal = "login" | "register" | null;
type Tab = "description" | "reviews";

const formatPrice = (value: number | undefined) =>
    `₹${Number(value ?? 0).toLocaleString("en-IN")}`;

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Something went wrong.";
}

function getReviews(data: unknown): Review[] {
    if (Array.isArray(data)) {
        return data as Review[];
    }

    if (data && typeof data === "object") {
        const result = data as {
            results?: unknown;
            reviews?: unknown;
        };

        if (Array.isArray(result.results)) {
            return result.results as Review[];
        }

        if (Array.isArray(result.reviews)) {
            return result.reviews as Review[];
        }
    }

    return [];
}

function StarRating({
    rating,
    size = "h-4 w-4",
}: {
    rating: number;
    size?: string;
}) {
    return (
        <div
            className="inline-flex items-center gap-0.5"
            aria-label={`${rating} out of 5 stars`}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${size} ${star <= Math.round(rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                        }`}
                />
            ))}
        </div>
    );
}

function SectionHeading({
    children,
    subtitle,
}: {
    children: ReactNode;
    subtitle?: string;
}) {
    return (
        <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {children}
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-orange-500" />
            {subtitle && (
                <p className="mt-3 text-sm text-gray-500">{subtitle}</p>
            )}
        </div>
    );
}

function BookDetailsPage() {
    const { id } = useParams<{ id: string }>();

    const [book, setBook] = useState<BookDetails | null>(null);
    const [books, setBooks] = useState<Book[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<Tab>("description");
    const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
    const [authModal, setAuthModal] = useState<AuthModal>(null);

    const [cartLoading, setCartLoading] = useState(false);
    const [cartMessage, setCartMessage] = useState("");
    const [cartError, setCartError] = useState("");

    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewMessage, setReviewMessage] = useState("");

    const [question, setQuestion] = useState("");
    const [questionMessage, setQuestionMessage] = useState("");



    useEffect(() => {
        if (!id) return;

        let cancelled = false;

        async function loadBookDetails(bookId: string) {
            setLoading(true);

            try {
                const bookResult = await getBookById(bookId);

                if (cancelled) return;

                setBook(bookResult as BookDetails);
                setError("");
                setLoading(false);

                void apiGet<unknown>(`reviews/book/${bookId}/`)
                    .then(getReviews)
                    .then((result) => {
                        if (!cancelled) {
                            setReviews(result);
                        }
                    })
                    .catch((err) => {
                        console.error("Failed to load reviews:", err);
                    });

                void getBooks({ page: 1 })
                    .then((response) => {
                        if (!cancelled) {
                            setBooks(response.results ?? []);
                        }
                    })
                    .catch((err) => {
                        console.error("Failed to load related books:", err);
                    });
            } catch (err: unknown) {
                if (cancelled) return;

                setError(getErrorMessage(err));
                setBook(null);
                setLoading(false);
            }
        }

        void loadBookDetails(id);

        return () => {
            cancelled = true;
        };
    }, [id]);


    const relatedBooks = useMemo(() => {
        if (!book) {
            return [];
        }

        const otherBooks = books.filter(
            (item) => String(item.id) !== String(book.id),
        );

        const sameCategory = otherBooks.filter(
            (item) =>
                Boolean(item.category) && item.category === book.category,
        );

        const remainingBooks = otherBooks.filter(
            (item) =>
                !sameCategory.some((related) => related.id === item.id),
        );

        return [...sameCategory, ...remainingBooks].slice(0, 6);
    }, [book, books]);

    const averageRating = Number(book?.average_rating ?? 0);
    const authorList = book?.authors ?? [];
    const stock = Number(book?.stock ?? 0);
    const outOfStock = book?.stock !== undefined && stock <= 0;

    async function addToCart() {
        if (!book || cartLoading) {
            return;
        }

        const token =
            localStorage.getItem("access_token") ??
            localStorage.getItem("token");

        if (!token) {
            setAuthModal("login");
            return;
        }

        setCartLoading(true);
        setCartError("");
        setCartMessage("");

        try {
            await apiPost("cart/add/", {
                book_id: book.id,
                quantity,
            });

            window.dispatchEvent(new Event("cartUpdated"));

            setCartMessage("Book added to your cart successfully.");
        } catch (err: unknown) {
            setCartError(getErrorMessage(err));
        } finally {
            setCartLoading(false);
        }
    }


    function handleReviewSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setReviewMessage("");

        const token =
            localStorage.getItem("access_token") ??
            localStorage.getItem("token");

        if (!token) {
            setAuthModal("login");
            return;
        }

        if (!reviewText.trim()) {
            setReviewMessage("Please enter your review.");
            return;
        }

        setReviewMessage(
            "The review submission API endpoint has not been configured yet.",
        );
    }

    function handleQuestionSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setQuestionMessage("");

        const token =
            localStorage.getItem("access_token") ??
            localStorage.getItem("token");

        if (!token) {
            setAuthModal("login");
            return;
        }

        if (!question.trim()) {
            setQuestionMessage("Please enter your question.");
            return;
        }

        setQuestionMessage(
            "The question submission API endpoint has not been configured yet.",
        );
    }

    if (!id) {
        return (
            <section className="mx-auto flex min-h-[55vh]  flex-col items-center justify-center px-4 text-center">
                <BookOpen className="mb-4 h-14 w-14 text-orange-300" />
                <h1 className="text-2xl font-bold text-gray-900">
                    Book ID is missing
                </h1>
                <p className="mt-2 text-gray-500">
                    Please select a book to view its details.
                </p>
                <Link
                    to="/store"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Store
                </Link>
            </section>
        );
    }

    if (loading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
                <LoaderCircle className="h-10 w-10 animate-spin text-orange-600" />
                <p className="text-sm font-medium text-gray-500">
                    Loading book details...
                </p>
            </div>
        );
    }

    if (error || !book) {
        return (
            <section className="mx-auto flex min-h-[55vh]  flex-col items-center justify-center px-4 text-center">
                <BookOpen className="mb-4 h-14 w-14 text-orange-300" />
                <h1 className="text-2xl font-bold text-gray-900">
                    Book not found
                </h1>
                <p className="mt-2 max-w-md text-gray-500">
                    {error || "We couldn't find the book you're looking for."}
                </p>
                <Link
                    to="/store"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Store
                </Link>
            </section>
        );
    }

    return (
        <>
            <main className="min-h-screen bg-white font-serif">
                <div className="border-b border-orange-100 bg-orange-50/60">
                    <div className="mx-auto flex  flex-wrap items-center gap-2 px-4 py-4 text-sm sm:px-6 lg:px-8">
                        <Link
                            to="/"
                            className="text-gray-500 transition hover:text-orange-600"
                        >
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        <Link
                            to="/store"
                            className="text-gray-500 transition hover:text-orange-600"
                        >
                            Store
                        </Link>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        <span className="max-w-[220px] truncate font-semibold text-orange-700">
                            {book.title}
                        </span>
                    </div>
                </div>

                <section className="mx-auto  px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
                        <div className="lg:col-span-4">
                            <div className="group flex min-h-[360px] items-center justify-center rounded-2xl border border-gray-100 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-8 sm:min-h-[460px]">
                                {book.image ? (
                                    <img
                                        src={book.image}
                                        alt={book.title}
                                        className="max-h-[420px] w-auto max-w-full rounded-lg object-contain shadow-xl transition duration-500 group-hover:scale-[1.03]"
                                    />
                                ) : (
                                    <BookOpen className="h-32 w-32 text-orange-200" />
                                )}
                            </div>
                            <p className="mt-4 text-center text-xs text-gray-400">
                                {book.category || "Arsha Vijnana Trust Publications"}
                            </p>
                        </div>

                        <div className="lg:col-span-5">
                            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                                {book.category || "Our Publication"}
                            </p>

                            <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
                                {book.title}
                            </h1>

                            {authorList.length > 0 && (
                                <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
                                    <span className="font-semibold text-gray-800">By</span>
                                    {authorList.map((author, index) => (
                                        <span key={author.id ?? `${author.name}-${index}`}>
                                            {index > 0 && <span className="mr-2">,</span>}
                                            <button
                                                type="button"
                                                onClick={() => setSelectedAuthor(author)}
                                                className="font-semibold text-orange-700 underline-offset-4 transition hover:text-orange-800 hover:underline"
                                            >
                                                {author.name}
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <StarRating rating={averageRating} />
                                <span className="text-sm font-semibold text-gray-700">
                                    {averageRating.toFixed(1)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("reviews")}
                                    className="text-sm text-gray-500 underline-offset-4 hover:text-orange-600 hover:underline"
                                >
                                    ({book.total_reviews ?? reviews.length} reviews)
                                </button>
                            </div>

                            <div className="mt-7 flex flex-wrap items-baseline gap-3">
                                <span className="text-3xl font-bold text-orange-700">
                                    {formatPrice(book.selling_price)}
                                </span>

                                {book.mrp > book.selling_price && (
                                    <>
                                        <span className="text-lg text-gray-400 line-through">
                                            {formatPrice(book.mrp)}
                                        </span>
                                        <span className="rounded-md bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                                            {Math.round(
                                                ((book.mrp - book.selling_price) / book.mrp) * 100,
                                            )}
                                            % OFF
                                        </span>
                                    </>
                                )}
                            </div>

                            {book.short_description && (
                                <p className="mt-5 leading-7 text-gray-600">
                                    {book.short_description}
                                </p>
                            )}

                            <div className="mt-7 overflow-hidden rounded-xl border border-gray-100">
                                {[
                                    ["Publisher", book.publisher || "N/A"],
                                    ["Publication Year", book.publication_year || "N/A"],
                                    ["Pages", book.pages || "N/A"],
                                    ["ISBN", book.isbn || "N/A"],
                                    [
                                        "Availability",
                                        book.stock === undefined
                                            ? "Contact for availability"
                                            : outOfStock
                                                ? "Out of stock"
                                                : `${stock} available`,
                                    ],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="grid grid-cols-2 gap-3 border-b border-gray-100 px-4 py-3 text-sm last:border-b-0"
                                    >
                                        <span className="font-semibold text-gray-600">
                                            {label}
                                        </span>
                                        <span
                                            className={`break-words text-right ${label === "Availability" && outOfStock
                                                ? "font-semibold text-red-600"
                                                : "text-gray-800"
                                                }`}
                                        >
                                            {value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-7">
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="inline-flex items-center rounded-xl border border-gray-200">
                                        <button
                                            type="button"
                                            aria-label="Decrease quantity"
                                            disabled={quantity <= 1}
                                            onClick={() =>
                                                setQuantity((value) => Math.max(1, value - 1))
                                            }
                                            className="rounded-l-xl p-3 text-gray-600 transition hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>

                                        <input
                                            type="number"
                                            aria-label="Quantity"
                                            min={1}
                                            max={book.stock}
                                            value={quantity}
                                            onChange={(event) => {
                                                const next = Number(event.target.value);

                                                if (Number.isFinite(next) && next >= 1) {
                                                    const nextQuantity = Math.floor(next);

                                                    setQuantity(
                                                        book.stock !== undefined
                                                            ? Math.min(
                                                                nextQuantity,
                                                                Math.max(1, stock),
                                                            )
                                                            : nextQuantity,
                                                    );
                                                }
                                            }}
                                            className="w-14 border-x border-gray-200 py-2.5 text-center text-sm font-semibold outline-none focus:bg-orange-50"
                                        />

                                        <button
                                            type="button"
                                            aria-label="Increase quantity"
                                            disabled={
                                                outOfStock ||
                                                (book.stock !== undefined && quantity >= stock)
                                            }
                                            onClick={() =>
                                                setQuantity((value) =>
                                                    book.stock !== undefined
                                                        ? Math.min(value + 1, stock)
                                                        : value + 1,
                                                )
                                            }
                                            className="rounded-r-xl p-3 text-gray-600 transition hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => void addToCart()}
                                        disabled={cartLoading || outOfStock}
                                        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
                                    >
                                        {cartLoading ? (
                                            <LoaderCircle className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <ShoppingBag className="h-5 w-5" />
                                        )}
                                        {cartLoading ? "Adding..." : "Buy Now"}
                                    </button>
                                </div>

                                {cartError && (
                                    <p role="alert" className="mt-3 text-sm text-red-600">
                                        {cartError}
                                    </p>
                                )}

                                {cartMessage && (
                                    <p
                                        role="status"
                                        className="mt-3 flex items-center gap-2 text-sm text-green-700"
                                    >
                                        <Check className="h-4 w-4" />
                                        {cartMessage}
                                    </p>
                                )}
                            </div>

                            <div className="mt-6 flex items-start gap-3 rounded-xl bg-orange-50 p-4">
                                <ShoppingBag className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">
                                        Shop with confidence
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-gray-500">
                                        Explore our publications and find books for your learning
                                        journey.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <aside className="lg:col-span-3">
                            <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-6">
                                <div className="mb-4 flex items-center gap-2">
                                    <BookOpen className="h-5 w-5 text-orange-600" />
                                    <h2 className="text-lg font-bold text-gray-900">
                                        About this book
                                    </h2>
                                </div>

                                <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
                                    {book.short_description ||
                                        "Explore this publication and discover more about its contents."}
                                </p>

                                <div className="mt-6 border-t border-gray-200 pt-5">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Publication details
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-gray-600">
                                        {book.publisher || "Arsha Vijnana Trust"}
                                    </p>
                                </div>

                                <Link
                                    to="/store"
                                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-700 transition hover:text-orange-800"
                                >
                                    Explore more books
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </aside>
                    </div>

                    <section className="mt-16">
                        <div className="flex flex-wrap border-b border-gray-200">
                            <button
                                type="button"
                                onClick={() => setActiveTab("description")}
                                className={`border-b-2 px-5 py-4 text-sm font-bold transition ${activeTab === "description"
                                    ? "border-orange-600 text-orange-700"
                                    : "border-transparent text-gray-500 hover:text-orange-600"
                                    }`}
                            >
                                DESCRIPTION
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab("reviews")}
                                className={`border-b-2 px-5 py-4 text-sm font-bold transition ${activeTab === "reviews"
                                    ? "border-orange-600 text-orange-700"
                                    : "border-transparent text-gray-500 hover:text-orange-600"
                                    }`}
                            >
                                REVIEWS ({reviews.length})
                            </button>
                        </div>

                        <div className="py-7">
                            {activeTab === "description" ? (
                                <div className="w-full whitespace-pre-line text-sm leading-8 text-gray-600">
                                    {book.description ||
                                        book.short_description ||
                                        "Description is not available for this book."}
                                </div>
                            ) : (
                                <div className="w-full">
                                    {reviews.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-gray-200 px-6 py-12 text-center">
                                            <Star className="mx-auto h-9 w-9 text-orange-300" />
                                            <p className="mt-3 font-semibold text-gray-800">
                                                No reviews yet
                                            </p>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Be the first to share your experience.
                                            </p>
                                        </div>
                                    ) : (
                                        reviews.map((review, index) => (
                                            <article
                                                key={review.id ?? index}
                                                className="border-b border-gray-100 py-5 last:border-b-0"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                                                            <UserRound className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">
                                                                {review.name || "Anonymous"}
                                                            </p>
                                                            <StarRating
                                                                rating={Number(review.rating ?? 0)}
                                                            />
                                                        </div>
                                                    </div>

                                                    {review.created_at && (
                                                        <time className="text-xs text-gray-400">
                                                            {new Date(
                                                                review.created_at,
                                                            ).toLocaleDateString()}
                                                        </time>
                                                    )}
                                                </div>

                                                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600">
                                                    {review.review || ""}
                                                </p>
                                            </article>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {relatedBooks.length > 0 && (
                        <section className="mt-12 border-t border-gray-100 pt-12">
                            <SectionHeading subtitle="Discover more titles from our collection">
                                Related Books
                            </SectionHeading>

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                                {relatedBooks.map((item) => (
                                    <Link
                                        key={item.id}
                                        to={`/store/${item.id}`}
                                        className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5"
                                    >
                                        <div className="flex h-48 items-center justify-center bg-orange-50/70 p-5 sm:h-60">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    loading="lazy"
                                                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <BookOpen className="h-16 w-16 text-orange-200" />
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <h3 className="line-clamp-2 min-h-12 font-bold leading-6 text-gray-900 transition group-hover:text-orange-700">
                                                {item.title}
                                            </h3>

                                            <p className="mt-2 line-clamp-1 text-xs text-gray-500">
                                                {item.authors
                                                    ?.map((author) => author.name)
                                                    .join(", ") || "Arsha Vijnana Trust"}
                                            </p>

                                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                                <span className="font-bold text-orange-700">
                                                    {formatPrice(item.selling_price)}
                                                </span>
                                                {item.mrp > item.selling_price && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        {formatPrice(item.mrp)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    <section
                        id="FAQ"
                        className="mt-16 scroll-mt-28 border-t border-gray-100 pt-12"
                    >
                        <SectionHeading>Frequently Asked Questions</SectionHeading>

                        <div className="mx-auto max-w-4xl divide-y divide-gray-100">
                            {[
                                {
                                    question: "Do you offer express shipping?",
                                    answer:
                                        "Express delivery may be available for eligible Indian PIN codes. Please contact the trust for availability and charges.",
                                },
                                {
                                    question: "What locations do you deliver to?",
                                    answer:
                                        "Delivery availability depends on your destination and the shipping options provided at checkout.",
                                },
                                {
                                    question: "Can I return the book?",
                                    answer:
                                        "Please contact the trust to confirm the applicable return policy and conditions before returning an item.",
                                },
                            ].map((item) => (
                                <details key={item.question} className="group py-5">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-gray-800 transition hover:text-orange-700">
                                        <span className="flex items-center gap-3">
                                            <CircleHelp className="h-5 w-5 shrink-0 text-orange-500" />
                                            {item.question}
                                        </span>
                                        <Plus className="h-4 w-4 shrink-0 transition group-open:rotate-45" />
                                    </summary>
                                    <p className="mt-4 pl-8 text-sm leading-7 text-gray-600">
                                        {item.answer}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </section>

                    <section className="mt-16 grid grid-cols-1 gap-6 border-t border-gray-100 pt-12 lg:grid-cols-2">
                        <form
                            onSubmit={handleReviewSubmit}
                            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
                        >
                            <h2 className="text-xl font-bold text-gray-900">
                                Write a Review
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Share your experience with this book.
                            </p>

                            <label className="mb-3 mt-6 block text-sm font-semibold text-gray-700">
                                Your rating
                            </label>

                            <div className="mb-5 flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        aria-label={`Rate ${star} out of 5`}
                                        onClick={() => setReviewRating(star)}
                                    >
                                        <Star
                                            className={`h-7 w-7 transition ${star <= reviewRating
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-gray-300 hover:text-amber-300"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>

                            <label
                                htmlFor="reviewText"
                                className="mb-2 block text-sm font-semibold text-gray-700"
                            >
                                Review
                            </label>

                            <textarea
                                id="reviewText"
                                rows={5}
                                required
                                value={reviewText}
                                onChange={(event) => setReviewText(event.target.value)}
                                placeholder="Share your thoughts about this book..."
                                className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                            />

                            {reviewMessage && (
                                <p role="status" className="mt-3 text-sm text-orange-700">
                                    {reviewMessage}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="mt-4 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
                            >
                                Submit Review
                            </button>
                        </form>

                        <form
                            onSubmit={handleQuestionSubmit}
                            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8"
                        >
                            <h2 className="text-xl font-bold text-gray-900">
                                Ask a Question
                            </h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Have a question about this publication?
                            </p>

                            <label
                                htmlFor="questionText"
                                className="mb-2 mt-6 block text-sm font-semibold text-gray-700"
                            >
                                Question / Comment
                            </label>

                            <textarea
                                id="questionText"
                                rows={5}
                                required
                                value={question}
                                onChange={(event) => setQuestion(event.target.value)}
                                placeholder="Ask us anything about this book..."
                                className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                            />

                            <p className="mt-4 text-xs leading-6 text-gray-400">
                                By continuing, you agree to the applicable Terms of Use and
                                Privacy Policy.
                            </p>

                            {questionMessage && (
                                <p role="status" className="mt-3 text-sm text-orange-700">
                                    {questionMessage}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="mt-4 rounded-xl bg-orange-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
                            >
                                Submit Question
                            </button>
                        </form>
                    </section>
                </section>
            </main>

            {selectedAuthor && (
                <div
                    className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-gray-950/60 p-4 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setSelectedAuthor(null);
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="author-title"
                        className="relative my-auto w-full max-w-7xl overflow-hidden rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                            <h2
                                id="author-title"
                                className="text-lg font-bold text-gray-900"
                            >
                                Author Details
                            </h2>
                            <button
                                type="button"
                                onClick={() => setSelectedAuthor(null)}
                                aria-label="Close author details"
                                className="rounded-full p-2 text-gray-500 transition hover:bg-orange-50 hover:text-orange-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-3 sm:p-8">
                            <div className="flex min-h-40 items-center justify-center rounded-xl bg-orange-50 p-4">
                                {selectedAuthor.image ? (
                                    <img
                                        src={selectedAuthor.image}
                                        alt={selectedAuthor.name}
                                        className="max-h-72 w-full rounded-lg object-contain"
                                    />
                                ) : (
                                    <UserRound className="h-20 w-20 text-orange-300" />
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {selectedAuthor.name}
                                </h3>
                                <div className="my-4 h-1 w-12 rounded-full bg-orange-500" />
                                <p className="whitespace-pre-line text-sm leading-7 text-gray-600">
                                    {selectedAuthor.biography || "Biography not available."}
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {authModal === "login" && (
                <LoginModal
                    onClose={() => setAuthModal(null)}
                    onSwitchToRegister={() => setAuthModal("register")}
                    onLoginSuccess={() => {
                        setAuthModal(null);
                        void addToCart();
                    }}
                />
            )}

            {authModal === "register" && (
                <RegisterModal
                    onClose={() => setAuthModal(null)}
                    onSwitchToLogin={() => setAuthModal("login")}
                />
            )}
        </>
    );
}

export default BookDetailsPage;
