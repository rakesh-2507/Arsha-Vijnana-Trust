
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBooksPage } from "../api/books";
import type { Book } from "../api/books";

import banner1 from "../assets/banner-1.jpg";
import banner2 from "../assets/banner-2.jpg";
import banner3 from "../assets/banner-3.jpg";

const CATEGORY_ORDER = [
    "Ramayanam",
    "Mahabharatham",
    "BSB & BG",
    "BS and BG",
    "Independent Titles",
    "English Books",
];

const BANNERS = [
    {
        image: banner1,
        subtitle: "Explore Our Collection",
        title: "Books that Inspire",
        description:
            "Discover timeless wisdom, ancient knowledge, and inspiring stories for every reader.",
        button: "Explore Books",
    },
    {
        image: banner2,
        subtitle: "Discover Something New",
        title: "Knowledge for Every Journey",
        description:
            "Find meaningful books that enrich your mind and bring timeless teachings closer to you.",
        button: "Discover More",
    },
    {
        image: banner3,
        subtitle: "Read. Reflect. Grow.",
        title: "Wisdom for Everyday Life",
        description:
            "Explore a collection of books that inspire learning, reflection, and personal growth.",
        button: "Shop Collection",
    },
];

function formatPrice(price: number) {
    return Number(price || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2,
    });
}

function StarRating({ rating = 0 }: { rating?: number }) {
    const roundedRating = Math.max(0, Math.min(5, Math.round(rating)));

    return (
        <div
            className="flex items-center gap-0.5 text-amber-400"
            aria-label={`Rating: ${rating} out of 5`}
        >
            {Array.from({ length: 5 }, (_, index) => (
                <svg
                    key={index}
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 ${index < roundedRating
                        ? "fill-current"
                        : "fill-none stroke-current"
                        }`}
                    strokeWidth="1.7"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m12 3 2.75 5.58 6.16.9-4.46 4.34 1.05 6.13L12 17.06l-5.5 2.89 1.05-6.13-4.46-4.34 6.16-.9L12 3Z"
                    />
                </svg>
            ))}
        </div>
    );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {direction === "left" ? (
                <path d="m15 18-6-6 6-6" />
            ) : (
                <path d="m9 18 6-6-6-6" />
            )}
        </svg>
    );
}

function BookIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            className="h-12 w-12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M12 7v14" />
            <path d="M3 18V5a2 2 0 0 1 2-2h2a5 5 0 0 1 5 5 5 5 0 0 1 5-5h2a2 2 0 0 1 2 2v13h-4a5 5 0 0 0-5 3 5 5 0 0 0-5-3H3Z" />
        </svg>
    );
}

function HomePage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [activeBanner, setActiveBanner] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function loadBooks() {
            try {
                setLoading(true);
                setLoadingMore(false);
                setError("");

                // Fetch page 1 and display books immediately.
                const firstPage = await getBooksPage(1);

                if (cancelled) return;

                setBooks(firstPage.results ?? []);
                setLoading(false);

                // Fetch remaining pages in the background.
                if (firstPage.next) {
                    setLoadingMore(true);
                }

                let pageNumber = 2;
                let hasMore = Boolean(firstPage.next);

                while (hasMore && !cancelled) {
                    const response = await getBooksPage(pageNumber);

                    if (cancelled) return;

                    setBooks((previousBooks) => {
                        const existingIds = new Set(
                            previousBooks.map((book) => book.id)
                        );

                        const newBooks = (response.results ?? []).filter(
                            (book) => !existingIds.has(book.id)
                        );

                        return [...previousBooks, ...newBooks];
                    });

                    hasMore = Boolean(response.next);
                    pageNumber += 1;
                }
            } catch (err) {
                console.error("Failed to load books:", err);

                if (!cancelled) {
                    setError(
                        "Some books could not be loaded. Please try again."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                    setLoadingMore(false);
                }
            }
        }

        void loadBooks();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setActiveBanner(
                (current) => (current + 1) % BANNERS.length
            );
        }, 5000);

        return () => window.clearInterval(interval);
    }, []);

    const showPreviousBanner = () => {
        setActiveBanner(
            (current) =>
                (current - 1 + BANNERS.length) % BANNERS.length
        );
    };

    const showNextBanner = () => {
        setActiveBanner(
            (current) => (current + 1) % BANNERS.length
        );
    };

    // Group the books received so far by their actual API category.
    const groupedBooks = books.reduce<Record<string, Book[]>>(
        (groups, book) => {
            const category = book.category?.trim() || "Other";

            if (!groups[category]) {
                groups[category] = [];
            }

            groups[category].push(book);

            return groups;
        },
        {}
    );

    const sortedCategories = Object.entries(groupedBooks)
        .map(([category, categoryBooks]) => ({
            category,
            books: [...categoryBooks].sort(
                (a, b) =>
                    (a.display_order ?? 0) - (b.display_order ?? 0)
            ),
        }))
        .sort((a, b) => {
            const indexA = CATEGORY_ORDER.indexOf(a.category);
            const indexB = CATEGORY_ORDER.indexOf(b.category);

            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }

            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;

            return a.category.localeCompare(b.category);
        });

    return (
        <main className="min-h-screen bg-white text-gray-800">
            {/* Banner carousel */}
            <section
                className="relative w-full overflow-hidden bg-gray-950"
                aria-label="Featured book collections"
            >
                <div className="relative h-[360px] w-full sm:h-[480px] lg:h-[520px]">
                    {BANNERS.map((banner, index) => {
                        const isActive = activeBanner === index;

                        return (
                            <div
                                key={banner.image}
                                aria-hidden={!isActive}
                                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${isActive
                                    ? "z-10 opacity-100"
                                    : "pointer-events-none z-0 opacity-0"
                                    }`}
                            >
                                <img
                                    src={banner.image}
                                    alt=""
                                    className={`absolute inset-0 h-full w-full object-cover object-center transition-transform duration-[6000ms] ease-out ${isActive
                                        ? "scale-105"
                                        : "scale-100"
                                        }`}
                                />

                                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
                                <div className="absolute inset-0 bg-black/10" />

                                <div className="absolute inset-0 z-10 flex items-center justify-center px-12 pb-12 pt-10 text-center sm:px-20 lg:px-28">
                                    <div
                                        className={`mx-auto max-w-4xl transition-all duration-700 ${isActive
                                            ? "translate-y-0 opacity-100"
                                            : "translate-y-4 opacity-0"
                                            }`}
                                    >
                                        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-200 backdrop-blur-sm sm:text-sm">
                                            <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                                            {banner.subtitle}
                                        </span>

                                        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
                                            {banner.title}
                                        </h1>

                                        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/90 sm:mt-7 sm:text-base sm:leading-8 md:text-lg">
                                            {banner.description}
                                        </p>

                                        <Link
                                            to="/store"
                                            tabIndex={isActive ? 0 : -1}
                                            className="group mt-8 inline-flex items-center justify-center gap-3 rounded-full bg-orange-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-orange-950/20 transition duration-300 hover:-translate-y-1 hover:bg-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-300/60 sm:mt-10 sm:px-9 sm:py-4 sm:text-base"
                                        >
                                            {banner.button}

                                            <svg
                                                viewBox="0 0 24 24"
                                                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <path d="M5 12h14" />
                                                <path d="m12 5 7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Previous arrow */}
                    <button
                        type="button"
                        onClick={showPreviousBanner}
                        aria-label="Previous banner"
                        className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/25 text-white backdrop-blur-sm transition hover:border-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 sm:left-6 sm:h-12 sm:w-12 lg:left-10"
                    >
                        <ArrowIcon direction="left" />
                    </button>

                    {/* Next arrow */}
                    <button
                        type="button"
                        onClick={showNextBanner}
                        aria-label="Next banner"
                        className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/25 text-white backdrop-blur-sm transition hover:border-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 sm:right-6 sm:h-12 sm:w-12 lg:right-10"
                    >
                        <ArrowIcon direction="right" />
                    </button>

                    {/* Bottom indicators */}
                    <div className="absolute bottom-7 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
                        {BANNERS.map((banner, index) => (
                            <button
                                key={banner.image}
                                type="button"
                                onClick={() => setActiveBanner(index)}
                                aria-label={`Show banner ${index + 1}`}
                                aria-current={
                                    activeBanner === index
                                        ? "true"
                                        : undefined
                                }
                                className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-black ${activeBanner === index
                                    ? "w-9 bg-orange-500"
                                    : "w-2.5 bg-white/70 hover:bg-white"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Slide counter */}
                    <div className="absolute bottom-6 right-6 z-20 hidden items-center gap-2 text-sm font-semibold text-white sm:flex lg:right-10">
                        <span className="text-orange-400">
                            {String(activeBanner + 1).padStart(2, "0")}
                        </span>
                        <span className="text-white/50">/</span>
                        <span className="text-white/70">
                            {String(BANNERS.length).padStart(2, "0")}
                        </span>
                    </div>
                </div>
            </section>

            {/* Books section */}
            <section className="py-12 sm:py-16 lg:py-20">
                <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
                    {/* Initial loading */}
                    {loading && books.length === 0 && (
                        <div className="flex min-h-64 flex-col items-center justify-center">
                            <div
                                className="h-12 w-12 animate-spin rounded-full border-4 border-orange-100 border-t-orange-600"
                                role="status"
                                aria-label="Loading books"
                            />
                            <p className="mt-4 text-sm text-gray-500">
                                Loading books...
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="flex min-h-64 flex-col items-center justify-center text-center">
                            <p className="text-lg font-semibold text-red-600">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="mt-5 rounded-full bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !error && books.length === 0 && (
                        <div className="flex min-h-64 flex-col items-center justify-center text-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                                <BookIcon />
                            </div>

                            <h2 className="mt-5 text-xl font-bold text-gray-800">
                                No Books Found
                            </h2>

                            <p className="mt-2 text-sm text-gray-500">
                                Please check back later for our book
                                collection.
                            </p>
                        </div>
                    )}

                    {/* Category sections */}
                    {!error &&
                        sortedCategories.map(({ category, books }) => (
                            <section
                                key={category}
                                className="mb-14 last:mb-0"
                            >
                                {/* Category heading */}
                                <div className="mb-7 flex items-end justify-between gap-4 border-b border-gray-200 pb-4">
                                    <div>
                                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-600">
                                            Explore Our Collection
                                        </p>

                                        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                                            {category}
                                        </h2>
                                    </div>

                                    <Link
                                        to={`/store?category=${encodeURIComponent(category)}`}
                                        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-orange-200 px-4 py-2.5 text-xs font-bold text-orange-700 transition hover:border-orange-600 hover:bg-orange-600 hover:text-white sm:px-5 sm:text-sm"
                                    >
                                        View All
                                        <ArrowIcon direction="right" />
                                    </Link>
                                </div>

                                {/* Book grid */}
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-6 xl:gap-6">
                                    {books.slice(0, 6).map((book) => (
                                        <Link
                                            key={book.id}
                                            to={`/store/${book.id}`}
                                            className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5 focus:outline-none focus:ring-2 focus:ring-orange-400 sm:p-4"
                                        >
                                            {/* Book image */}
                                            <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-xl bg-gray-50 sm:h-56 lg:h-60">
                                                {book.image ? (
                                                    <img
                                                        src={book.image}
                                                        alt={book.title}
                                                        loading="lazy"
                                                        className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-orange-300">
                                                        <BookIcon />
                                                        <span className="text-xs text-gray-400">
                                                            No image
                                                        </span>
                                                    </div>
                                                )}

                                                <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-orange-700 shadow-sm sm:text-xs">
                                                    Book
                                                </span>
                                            </div>

                                            {/* Book information */}
                                            <div className="flex flex-1 flex-col pt-4">
                                                <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-gray-900 transition group-hover:text-orange-700 sm:text-base">
                                                    {book.title}
                                                </h3>

                                                <p className="mt-2 line-clamp-2 min-h-8 text-xs leading-4 text-gray-500 sm:text-sm">
                                                    {(book.authors ?? [])
                                                        .map(
                                                            (author) =>
                                                                author.name
                                                        )
                                                        .join(", ") ||
                                                        "Arsha Vijnana Trust"}
                                                </p>

                                                <div className="mt-3 flex items-center gap-1.5">
                                                    <StarRating
                                                        rating={
                                                            book.average_rating ??
                                                            0
                                                        }
                                                    />

                                                    <span className="text-xs text-gray-400">
                                                        ({book.total_reviews ?? 0})
                                                    </span>
                                                </div>

                                                <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-4">
                                                    <span className="text-base font-extrabold text-gray-900 sm:text-lg">
                                                        ₹
                                                        {formatPrice(
                                                            book.selling_price
                                                        )}
                                                    </span>

                                                    {book.mrp >
                                                        book.selling_price && (
                                                            <span className="text-xs text-gray-400 line-through">
                                                                ₹
                                                                {formatPrice(
                                                                    book.mrp
                                                                )}
                                                            </span>
                                                        )}
                                                </div>

                                                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-orange-50 px-3 py-2.5 text-xs font-bold text-orange-700 transition group-hover:bg-orange-600 group-hover:text-white sm:text-sm">
                                                    View Details
                                                    <ArrowIcon direction="right" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        ))}


                    {/* Background loading indicator */}
                    {loadingMore && !error && (
                        <div className="flex items-center justify-center gap-3 py-8 text-sm text-gray-500">
                            <span
                                className="h-5 w-5 animate-spin rounded-full border-2 border-orange-100 border-t-orange-600"
                                aria-hidden="true"
                            />
                            Loading more books...
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default HomePage;
