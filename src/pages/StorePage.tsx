
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    AlertCircle,
    BookOpen,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    SlidersHorizontal,
    Star,
} from "lucide-react";

import { getAllBooks } from "../api/books";
import type { Book } from "../api/books";

const PAGE_SIZE = 12;

type Author = NonNullable<Book["authors"]>[number];

type SortOrder = "" | "price" | "-price";

function formatPrice(price: number | undefined) {
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
                <Star
                    key={index}
                    size={14}
                    strokeWidth={1.7}
                    className={
                        index < roundedRating
                            ? "fill-current"
                            : "fill-none"
                    }
                />
            ))}
        </div>
    );
}

function BookPlaceholder() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-orange-50 text-orange-300">
            <BookOpen size={48} strokeWidth={1.3} />
            <span className="text-xs text-gray-400">No image available</span>
        </div>
    );
}

function StorePage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedCategory = searchParams.get("category") || "all";

    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedAuthor, setSelectedAuthor] = useState("");
    const [sortOrder, setSortOrder] = useState<SortOrder>("");
    const [featured, setFeatured] = useState(false);
    const [bestseller, setBestseller] = useState(false);
    const [newArrival, setNewArrival] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch the complete collection once.
    useEffect(() => {
        let cancelled = false;

        async function loadBooks() {
            try {
                const result = await getAllBooks();

                if (!cancelled) {
                    setBooks(result);
                    setError("");
                }
            } catch (err) {
                console.error("Failed to load store books:", err);

                if (!cancelled) {
                    setError("Unable to load books. Please try again.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadBooks();

        return () => {
            cancelled = true;
        };
    }, []);

    // Build unique categories from the available books.
    const categories = useMemo(
        () =>
            Array.from(
                new Set(
                    books
                        .map((book) => book.category)
                        .filter(
                            (category): category is string =>
                                Boolean(category)
                        )
                )
            ).sort((a, b) => a.localeCompare(b)),
        [books]
    );

    // Build a unique author list.
    const authors = useMemo(() => {
        const authorMap = new Map<string, Author>();

        books.forEach((book) => {
            (book.authors ?? []).forEach((author) => {
                if (author.id !== undefined && author.id !== null) {
                    authorMap.set(String(author.id), author);
                } else {
                    authorMap.set(`name:${author.name}`, author);
                }
            });
        });

        return Array.from(authorMap.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }, [books]);

    // Apply category, author, and special filters, then sort.
    const filteredBooks = useMemo(() => {
        let result = books.filter((book) => {
            if (
                selectedCategory !== "all" &&
                book.category !== selectedCategory
            ) {
                return false;
            }

            if (
                selectedAuthor &&
                !(book.authors ?? []).some(
                    (author) => String(author.id) === selectedAuthor
                )
            ) {
                return false;
            }

            if (featured && !book.featured) {
                return false;
            }

            if (bestseller && !book.bestseller) {
                return false;
            }

            if (newArrival && !book.new_arrival) {
                return false;
            }
            return true;
        });

        result = [...result];

        if (sortOrder === "price") {
            result.sort(
                (a, b) =>
                    Number(a.selling_price || 0) -
                    Number(b.selling_price || 0)
            );
        } else if (sortOrder === "-price") {
            result.sort(
                (a, b) =>
                    Number(b.selling_price || 0) -
                    Number(a.selling_price || 0)
            );
        } else {
            result.sort(
                (a, b) =>
                    Number(a.display_order || 0) -
                    Number(b.display_order || 0)
            );
        }

        return result;
    }, [
        books,
        selectedCategory,
        selectedAuthor,
        featured,
        bestseller,
        newArrival,
        sortOrder,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredBooks.length / PAGE_SIZE)
    );

    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * PAGE_SIZE;
    const currentBooks = filteredBooks.slice(
        startIndex,
        startIndex + PAGE_SIZE
    );

    const changeCategory = (category: string) => {
        const nextParams = new URLSearchParams(searchParams);

        if (category === "all") {
            nextParams.delete("category");
        } else {
            nextParams.set("category", category);
        }

        setSearchParams(nextParams);
        setCurrentPage(1);
    };

    const resetFilters = () => {
        setSelectedAuthor("");
        setFeatured(false);
        setBestseller(false);
        setNewArrival(false);
        setSortOrder("");
        setCurrentPage(1);
        setSearchParams({});
    };

    const changePage = (page: number) => {
        if (page < 1 || page > totalPages) return;

        setCurrentPage(page);

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const hasActiveFilters =
        selectedCategory !== "all" ||
        selectedAuthor !== "" ||
        featured ||
        bestseller ||
        newArrival;

    return (
        <main className="min-h-screen bg-white text-gray-800">
            {/* Page heading */}
            <section className="border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50">
                <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-orange-600 sm:text-sm">
                        Arsha Vijnana Trust
                    </p>

                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                        Our Store
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
                        Explore books that share timeless wisdom, knowledge,
                        and meaningful teachings.
                    </p>

                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                        <Link
                            to="/"
                            className="transition hover:text-orange-700"
                        >
                            Home
                        </Link>
                        <ChevronRight size={15} />
                        <span className="font-semibold text-orange-700">
                            Store
                        </span>
                        {selectedCategory !== "all" && (
                            <>
                                <ChevronRight size={15} />
                                <span className="truncate text-gray-700">
                                    {selectedCategory}
                                </span>
                            </>
                        )}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
                    {/* Filter sidebar */}
                    <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal
                                    size={19}
                                    className="text-orange-600"
                                />
                                <h2 className="font-bold text-gray-900">
                                    Filters
                                </h2>
                            </div>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="text-xs font-semibold text-orange-700 hover:text-orange-900"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Categories */}
                        <div className="border-t border-gray-100 py-5">
                            <h3 className="mb-4 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-gray-800">
                                Category
                                <ChevronDown size={15} />
                            </h3>

                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => changeCategory("all")}
                                    className={`flex w-full items-center justify-between gap-2 text-left text-sm transition ${selectedCategory === "all"
                                            ? "font-bold text-orange-700"
                                            : "text-gray-600 hover:text-orange-700"
                                        }`}
                                >
                                    <span>All Categories</span>
                                    {selectedCategory === "all" && (
                                        <span className="h-2 w-2 rounded-full bg-orange-600" />
                                    )}
                                </button>

                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() => changeCategory(category)}
                                        className={`flex w-full items-center justify-between gap-2 text-left text-sm transition ${selectedCategory === category
                                                ? "font-bold text-orange-700"
                                                : "text-gray-600 hover:text-orange-700"
                                            }`}
                                    >
                                        <span>{category}</span>
                                        {selectedCategory === category && (
                                            <span className="h-2 w-2 rounded-full bg-orange-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Authors */}
                        <div className="border-t border-gray-100 py-5">
                            <h3 className="mb-4 flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-gray-800">
                                Author
                                <ChevronDown size={15} />
                            </h3>

                            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                                <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-600 hover:text-orange-700">
                                    <input
                                        type="radio"
                                        name="book-author"
                                        checked={selectedAuthor === ""}
                                        onChange={() => {
                                            setSelectedAuthor("");
                                            setCurrentPage(1);
                                        }}
                                        className="h-4 w-4 accent-orange-600"
                                    />
                                    All Authors
                                </label>

                                {authors.map((author) => {
                                    const authorValue =
                                        author.id !== undefined &&
                                            author.id !== null
                                            ? String(author.id)
                                            : "";

                                    if (!authorValue) return null;

                                    return (
                                        <label
                                            key={authorValue}
                                            className="flex cursor-pointer items-start gap-3 text-sm text-gray-600 hover:text-orange-700"
                                        >
                                            <input
                                                type="radio"
                                                name="book-author"
                                                value={authorValue}
                                                checked={
                                                    selectedAuthor ===
                                                    authorValue
                                                }
                                                onChange={() => {
                                                    setSelectedAuthor(
                                                        authorValue
                                                    );
                                                    setCurrentPage(1);
                                                }}
                                                className="mt-0.5 h-4 w-4 accent-orange-600"
                                            />
                                            <span>{author.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Special filters */}
                        <div className="border-t border-gray-100 py-5">
                            <h3 className="mb-4 text-xs font-extrabold uppercase tracking-wider text-gray-800">
                                Special filters
                            </h3>

                            <div className="space-y-4">
                                <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={featured}
                                        onChange={(event) => {
                                            setFeatured(event.target.checked);
                                            setCurrentPage(1);
                                        }}
                                        className="h-4 w-4 rounded accent-orange-600"
                                    />
                                    Featured
                                </label>

                                <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={bestseller}
                                        onChange={(event) => {
                                            setBestseller(event.target.checked);
                                            setCurrentPage(1);
                                        }}
                                        className="h-4 w-4 rounded accent-orange-600"
                                    />
                                    Best Seller
                                </label>

                                <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={newArrival}
                                        onChange={(event) => {
                                            setNewArrival(event.target.checked);
                                            setCurrentPage(1);
                                        }}
                                        className="h-4 w-4 rounded accent-orange-600"
                                    />
                                    New Arrival
                                </label>
                            </div>
                        </div>
                    </aside>

                    {/* Book collection */}
                    <div className="min-w-0">
                        {/* Result count and sort */}
                        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                                    {selectedCategory === "all"
                                        ? "All Books"
                                        : selectedCategory}
                                </h2>

                                {!loading && !error && (
                                    <p className="mt-1 text-sm text-gray-500">
                                        {filteredBooks.length === 0
                                            ? "Showing 0 results"
                                            : `Showing ${startIndex + 1}–${Math.min(
                                                startIndex + PAGE_SIZE,
                                                filteredBooks.length
                                            )} of ${filteredBooks.length} books`}
                                    </p>
                                )}
                            </div>

                            <label className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="shrink-0">Sort by</span>
                                <select
                                    value={sortOrder}
                                    onChange={(event) => {
                                        setSortOrder(
                                            event.target.value as SortOrder
                                        );
                                        setCurrentPage(1);
                                    }}
                                    className="min-w-44 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                                >
                                    <option value="">Latest</option>
                                    <option value="price">
                                        Price: Low to High
                                    </option>
                                    <option value="-price">
                                        Price: High to Low
                                    </option>
                                </select>
                            </label>
                        </div>

                        {/* Loading state */}
                        {loading && (
                            <div className="flex min-h-80 flex-col items-center justify-center">
                                <div
                                    role="status"
                                    aria-label="Loading books"
                                    className="h-12 w-12 animate-spin rounded-full border-4 border-orange-100 border-t-orange-600"
                                />
                                <p className="mt-4 text-sm text-gray-500">
                                    Loading our book collection...
                                </p>
                            </div>
                        )}

                        {/* Error state */}
                        {!loading && error && (
                            <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 px-5 text-center">
                                <AlertCircle
                                    size={42}
                                    className="text-red-500"
                                />
                                <h3 className="mt-4 text-lg font-bold text-gray-900">
                                    Something went wrong
                                </h3>
                                <p className="mt-2 text-sm text-gray-600">
                                    {error}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => window.location.reload()}
                                    className="mt-5 rounded-full bg-orange-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Empty state */}
                        {!loading &&
                            !error &&
                            filteredBooks.length === 0 && (
                                <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 px-5 text-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                                        <BookOpen size={38} />
                                    </div>
                                    <h3 className="mt-5 text-xl font-bold text-gray-900">
                                        No Books Found
                                    </h3>
                                    <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                        No books match your current filters.
                                        Try changing your category or filters.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="mt-5 rounded-full bg-orange-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}

                        {/* Book cards */}
                        {!loading && !error && currentBooks.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                                {currentBooks.map((book) => (
                                    <Link
                                        key={book.id}
                                        to={`/store/${book.id}`}
                                        className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-900/5 focus:outline-none focus:ring-2 focus:ring-orange-400 sm:p-4"
                                    >
                                        <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl bg-gray-50 sm:h-56 lg:h-60">
                                            {book.image ? (
                                                <img
                                                    src={book.image}
                                                    alt={book.title}
                                                    loading="lazy"
                                                    className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <BookPlaceholder />
                                            )}

                                           {book.new_arrival === true && (
                                                <span className="absolute left-2 top-2 rounded-full bg-orange-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm sm:text-xs">
                                                    New Arrival
                                                </span>
                                            )}

                                        {book.new_arrival !== true && book.bestseller === true && (
                                                    <span className="absolute left-2 top-2 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-800 sm:text-xs">
                                                        Best Seller
                                                    </span>
                                                )}
                                        </div>

                                        <div className="flex flex-1 flex-col pt-4">
                                            <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-gray-900 transition group-hover:text-orange-700 sm:text-base">
                                                {book.title}
                                            </h3>

                                            <p className="mt-2 line-clamp-2 min-h-8 text-xs leading-4 text-gray-500 sm:text-sm">
                                                {(book.authors ?? [])
                                                    .map(
                                                        (author) => author.name
                                                    )
                                                    .join(", ") ||
                                                    "Arsha Vijnana Trust"}
                                            </p>

                                            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                                <StarRating
                                                    rating={
                                                        book.average_rating ?? 0
                                                    }
                                                />
                                                <span className="text-xs text-gray-400">
                                                    (
                                                    {book.total_reviews ?? 0}
                                                    )
                                                </span>
                                            </div>

                                            <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-1 pt-4">
                                                <span className="text-base font-extrabold text-gray-900 sm:text-lg">
                                                    ₹
                                                    {formatPrice(
                                                        book.selling_price
                                                    )}
                                                </span>

                                                {Number(book.mrp) >
                                                    Number(
                                                        book.selling_price
                                                    ) && (
                                                        <span className="text-xs text-gray-400 line-through">
                                                            ₹
                                                            {formatPrice(book.mrp)}
                                                        </span>
                                                    )}
                                            </div>

                                            <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-orange-50 px-2 py-2.5 text-xs font-bold text-orange-700 transition group-hover:bg-orange-600 group-hover:text-white sm:text-sm">
                                                View Details
                                                <ChevronRight size={16} />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading &&
                            !error &&
                            filteredBooks.length > PAGE_SIZE && (
                                <nav
                                    aria-label="Book pagination"
                                    className="mt-10 flex flex-wrap items-center justify-center gap-2"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            changePage(safePage - 1)
                                        }
                                        disabled={safePage === 1}
                                        className="flex h-10 items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-700 transition hover:border-orange-400 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronLeft size={17} />
                                        <span className="hidden sm:inline">
                                            Previous
                                        </span>
                                    </button>

                                    {Array.from(
                                        { length: totalPages },
                                        (_, index) => index + 1
                                    )
                                        .filter(
                                            (page) =>
                                                page === 1 ||
                                                page === totalPages ||
                                                Math.abs(page - safePage) <= 1
                                        )
                                        .map((page, index, visiblePages) => {
                                            const previousPage =
                                                visiblePages[index - 1];

                                            return (
                                                <span
                                                    key={page}
                                                    className="contents"
                                                >
                                                    {previousPage !==
                                                        undefined &&
                                                        page -
                                                        previousPage >
                                                        1 && (
                                                            <span className="px-1 text-gray-400">
                                                                ...
                                                            </span>
                                                        )}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            changePage(page)
                                                        }
                                                        aria-current={
                                                            page === safePage
                                                                ? "page"
                                                                : undefined
                                                        }
                                                        className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-bold transition ${page === safePage
                                                                ? "border-orange-600 bg-orange-600 text-white"
                                                                : "border-gray-200 text-gray-700 hover:border-orange-400 hover:text-orange-700"
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                </span>
                                            );
                                        })}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            changePage(safePage + 1)
                                        }
                                        disabled={safePage === totalPages}
                                        className="flex h-10 items-center gap-1 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-700 transition hover:border-orange-400 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <span className="hidden sm:inline">
                                            Next
                                        </span>
                                        <ChevronRight size={17} />
                                    </button>
                                </nav>
                            )}

                        {!loading &&
                            !error &&
                            filteredBooks.length > 0 && (
                                <p className="mt-5 text-center text-xs text-gray-400">
                                    Page {safePage} of {totalPages}
                                </p>
                            )}
                    </div>
                </div>
            </section>
        </main>
    );
}

export default StorePage;
