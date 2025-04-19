import { useMemo, useState } from "react";
import useSWR from "swr";
import BookSpine from "@/components/BookSpine";
import BookSearch from "@/components/molecules/BookSearch";
import { BACKEND_URL } from "@/lib/constants";
import { fetcher } from "@/lib/utils";
import ErrorLoader from "./molecules/ErrorLoader";
import RequestLoader from "./molecules/RequestLoader";
import SearchBooksLoader from "./molecules/SearchBooksLoader";
import BooksNotFound from "./molecules/BooksNotFound";
import { useDebounce } from "../hooks/useDebounce";
import BookModal from "./BookModal";

const API_ENDPOINTS = {
  BOOKS: `${BACKEND_URL}/books`,
  TITLE_SEARCH: `${BACKEND_URL}/books/title`,
  AUTHOR_SEARCH: `${BACKEND_URL}/books/author`,
};

const SWR_OPTIONS = {
  errorRetryInterval: 3000,
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    if (retryCount >= 5) return;
    setTimeout(() => revalidate({ retryCount }), 5000);
  },
};

const SEARCH_SWR_OPTIONS = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  errorRetryCount: 3,
};

const BOOKS_PER_SHELF = 8;

export default function BookShelf() {
  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [activeBookId, setActiveBookId] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Datos de libros
  const { data: booksData, error: booksError, isLoading: isBooksLoading } =
    useSWR(API_ENDPOINTS.BOOKS, fetcher, SWR_OPTIONS);

  // Búsqueda
  const searchQueries = useMemo(() => {
    if (!debouncedSearchTerm) return null;
    return [
      `${API_ENDPOINTS.TITLE_SEARCH}?title=${encodeURIComponent(debouncedSearchTerm)}`,
      `${API_ENDPOINTS.AUTHOR_SEARCH}?author=${encodeURIComponent(debouncedSearchTerm)}`,
    ];
  }, [debouncedSearchTerm]);

  const { data: searchResults, error: searchError, isLoading: isSearching } =
    useSWR(searchQueries, (urls) => Promise.all(urls.map(fetcher)), SEARCH_SWR_OPTIONS);

  // Libros a mostrar
  const displayedBooks = useMemo(() => {
    if (!booksData) return [];
    if (!debouncedSearchTerm) return booksData;
    if (!searchResults) return [];

    return searchResults
      .flat()
      .filter((result) => result?.id && result?.title && result?.author)
      .reduce((uniqueBooks, book) => {
        if (!uniqueBooks.some((b) => b.id === book.id)) {
          uniqueBooks.push(book);
        }
        return uniqueBooks;
      }, []);
  }, [booksData, debouncedSearchTerm, searchResults]);

  // Libro activo para el modal
  const activeBookData = useMemo(() => {
    if (!booksData || !activeBookId) return null;
    return booksData.find((book) => book.id === activeBookId);
  }, [booksData, activeBookId]);

  // Handlers
  const handleBookClick = (bookId) => setActiveBookId(bookId);
  const handleCloseModal = () => setActiveBookId(null);

  // Organización en estanterías
  const bookShelves = useMemo(() => {
    if (!displayedBooks.length) return [];
    const shelves = [];
    for (let i = 0; i < Math.ceil(displayedBooks.length / BOOKS_PER_SHELF); i++) {
      shelves.push(displayedBooks.slice(i * BOOKS_PER_SHELF, (i + 1) * BOOKS_PER_SHELF));
    }
    return shelves;
  }, [displayedBooks]);

  // Renderizado condicional (fuera del flujo principal de hooks)
  if (booksError || searchError) return <ErrorLoader />;
  if (isBooksLoading) return <RequestLoader />;

  return (
    <div className="relative min-h-[calc(100vh-16rem)] p-4 overflow-y-auto">
      <BookSearch onSearch={setSearchTerm} />

      <div className="flex flex-col items-center mt-20">
        {bookShelves.length > 0 ? (
          bookShelves.map((shelf, shelfIndex) => (
            <div key={shelfIndex} className="relative w-full max-w-6xl -mb-3">
              {/* Parte superior de la estantería */}
              <div className="absolute -top-4 left-0 right-0 h-7 bg-brown-500 rounded-t-md z-10 bg-amber-800 border border-black"></div>
              {/* Parte inferior de la estantería */}
              <div className="absolute bottom-0 left-0 right-0 h-7 bg-amber-800 rounded-b-md z-10 border border-black"></div>


              {/* Lados de la estantería */}
              <div className="absolute -top-4 -left-7 bottom-0 w-12 bg-amber-800 rounded-l-md "></div>
              <div className="absolute -top-4 -right-7 bottom-0 w-12 bg-amber-800 rounded-r-md"></div>

              {/* Libros */}
              <div className="relative bg-amber-100 p-4 rounded-b-md shadow-lg bg-gray-900">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                  {shelf.map((book) => (
                    <BookSpine
                      key={book.id}
                      book={book}
                      onClick={handleBookClick}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : isSearching ? (
          <div className="relative w-full max-w-6xl">
            <div className="absolute -top-4 left-0 right-0 h-4 bg-amber-900 rounded-t-md"></div>
            <div className="bg-amber-100 p-8 rounded-b-md shadow-lg">
              <SearchBooksLoader />
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-6xl">
            <div className="absolute -top-4 left-0 right-0 h-4 bg-amber-900 rounded-t-md"></div>
            <div className="bg-amber-100 p-8 rounded-b-md shadow-lg">
              <BooksNotFound />
            </div>
          </div>
        )}
      </div>

      <BookModal
        isOpen={Boolean(activeBookData)}
        book={activeBookData}
        onClose={handleCloseModal}
      />
    </div>
  );
}