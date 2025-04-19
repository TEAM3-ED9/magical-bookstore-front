import { useCallback, useEffect, useMemo, useState } from "react";
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

// ========================= NUEVO CÓDIGO (ANTERIOR) =========================
const BOOKS_PER_SHELF = 4; // Define cuántos libros mostrar por balda
// ========================= FIN NUEVO CÓDIGO (ANTERIOR) =====================

export default function BookShelf() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeBookId, setActiveBookId] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data: booksData,
    error: booksError,
    isLoading: isBooksLoading,
  } = useSWR(API_ENDPOINTS.BOOKS, fetcher, SWR_OPTIONS);

  const searchQueries = useMemo(() => {
    if (!debouncedSearchTerm) return null;
    return [
      `${API_ENDPOINTS.TITLE_SEARCH}?title=${encodeURIComponent(
        debouncedSearchTerm
      )}`,
      `${API_ENDPOINTS.AUTHOR_SEARCH}?author=${encodeURIComponent(
        debouncedSearchTerm
      )}`,
    ];
  }, [debouncedSearchTerm]);

  const {
    data: searchResults,
    error: searchError,
    isLoading: isSearching,
  } = useSWR(
    searchQueries,
    (urls) => Promise.all(urls.map(fetcher)),
    SEARCH_SWR_OPTIONS
  );

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

  const activeBookData = useMemo(() => {
    if (!booksData || !activeBookId) return null;
    return booksData.find((book) => book.id === activeBookId);
  }, [booksData, activeBookId]);

  const handleBookClick = (bookId) => {
    setActiveBookId(bookId);
  };

  const handleCloseModal = () => {
    setActiveBookId(null);
  };

  if (booksError || searchError) {
    return <ErrorLoader />;
  }

  if (isBooksLoading) {
    return <RequestLoader />;
  }

  // ========================= NUEVO CÓDIGO (ANTERIOR) =========================
  const bookShelves = useMemo(() => {
    const shelves = [];
    for (let i = 0; i < Math.ceil(displayedBooks.length / BOOKS_PER_SHELF); i++) {
      shelves.push(displayedBooks.slice(i * BOOKS_PER_SHELF, (i + 1) * BOOKS_PER_SHELF));
    }
    return shelves;
  }, [displayedBooks]);
  // ========================= FIN NUEVO CÓDIGO (ANTERIOR) =====================

  return (
    // ========================= NUEVO CÓDIGO (ESTÉTICA) =========================
    <div className="relative min-h-[calc(100vh-16rem)] p-4 overflow-y-auto bg-gray-100"> {/* Fondo para simular pared */}
      <BookSearch onSearch={setSearchTerm} />

      <div className="space-y-6 mt-4"> {/* Margen superior para separar del buscador */}
        {bookShelves.map((shelf, index) => (
          <div
            key={index}
            className="bg-shelf-base rounded-md shadow-md relative" /* Base de la estantería */
            style={{
              padding: '1rem',
              borderLeft: '2px solid #a08863', /* Borde izquierdo */
              borderRight: '2px solid #a08863', /* Borde derecho */
            }}
          >
            {index > 0 && (
              <div
                className="absolute top-0 left-0 w-full h-0.5 bg-shelf-separator" /* Separador entre baldas */
              />
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1 md:gap-2">
              {isSearching ? (
                <SearchBooksLoader />
              ) : shelf.length === 0 && displayedBooks.length > 0 ? (
                <p className="col-span-full text-center text-gray-500">No hay libros en esta balda.</p>
              ) : displayedBooks.length === 0 && !isSearching ? (
                <BooksNotFound />
              ) : (
                shelf.map((book) => (
                  <BookSpine
                    key={book.id}
                    book={book}
                    onClick={handleBookClick}
                  />
                ))
              )}
            </div>
          </div>
        ))}
        {displayedBooks.length === 0 && !isSearching && bookShelves.length === 0 && (
          <div className="bg-shelf p-4 rounded-lg shadow-xl">
            <BooksNotFound />
          </div>
        )}
      </div>
      {/* ========================= FIN NUEVO CÓDIGO (ESTÉTICA) ===================== */}

      <BookModal
        isOpen={Boolean(activeBookData)}
        book={activeBookData}
        onClose={handleCloseModal}
      />
    </div>
  );
}