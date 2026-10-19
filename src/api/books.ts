
import { apiGet } from "./api";

export interface BookAuthor {
  id?: number;
  name: string;
}

export interface Book {
  id: number;
  title: string;
  image: string;
  description?: string;
  category?: string;
  authors?: BookAuthor[];
  average_rating?: number;
  total_reviews?: number;
  mrp: number;
  selling_price: number;
  display_order: number;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  count?: number;
  next: string | null;
  previous?: string | null;
  results: T[];
}

export interface BookQuery {
  search?: string;
  category?: string;
  page?: number;
  [key: string]: string | number | boolean | undefined;
}

const BOOKS_ENDPOINT = "books/";

// Fetch one page of books.
export const getBooks = (query?: BookQuery) =>
  apiGet<PaginatedResponse<Book>>(BOOKS_ENDPOINT, query);

// Explicit helper for progressive page loading.
export const getBooksPage = (page = 1) =>
  getBooks({ page });

// Fetch all books only when a screen needs the complete collection.
export const getAllBooks = async (): Promise<Book[]> => {
  const allBooks: Book[] = [];
  let pageNumber = 1;

  while (true) {
    const response = await getBooksPage(pageNumber);

    allBooks.push(...(response.results ?? []));

    if (!response.next) {
      break;
    }

    pageNumber++;
  }

  return allBooks;
};

// Fetch one book by ID.
export const getBookById = (id: number | string) =>
  apiGet<Book>(`books/${id}/`);

// Fetch categories represented on the first page.
// This does not guarantee that every category is included.
export const getBookCategories = async (): Promise<string[]> => {
  const response = await getBooks();

  return Array.from(
    new Set(
      (response.results ?? [])
        .map((book) => book.category?.trim())
        .filter((category): category is string => Boolean(category))
    )
  );
};
