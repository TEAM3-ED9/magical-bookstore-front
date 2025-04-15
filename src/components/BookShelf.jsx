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

export default function BookShelf() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeBookId, setActiveBookId] = useState(null);
  // ✅ Nuevo estado para rastrear si el libro activo está bloqueado
  const [isBookBlocked, setIsBookBlocked] = useState(false);
  // ✅ Nuevo estado para almacenar el resultado de la verificación de la respuesta
  const [answerResult, setAnswerResult] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data: booksData,
    error: booksError,
    isLoading: isBooksLoading,
  } = useSWR(API_ENDPOINTS.BOOKS, fetcher, SWR_OPTIONS);

  const searchQueries = useMemo(() => {
    if (!debouncedSearchTerm) return null;
    return [
      `${API_ENDPOINTS.TITLE_SEARCH}?title=${encodeURIComponent(debouncedSearchTerm)}`,
      `${API_ENDPOINTS.AUTHOR_SEARCH}?author=${encodeURIComponent(debouncedSearchTerm)}`,
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

  // ✅ Modifica handleBookClick para determinar isBlocked
  const handleBookClick = (bookId) => {
    setActiveBookId(bookId);
    const clickedBook = booksData?.find((book) => book.id === bookId);
    setIsBookBlocked(clickedBook?.status === 1); // Asume status 1 es bloqueado
    setAnswerResult(null); // Resetear resultado al abrir un nuevo libro
  };

  const handleCloseModal = () => {
    setActiveBookId(null);
    setIsBookBlocked(false);
    setAnswerResult(null);
  };

  // ✅ Función para manejar el envío de la respuesta desde el modal
  const handleAnswerSubmit = async (bookId, answer) => {
    try {
      const response = await fetch(`/api/books/${bookId}/verify-answer`, { // ⚠️ Reemplaza con tu endpoint real
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer }),
      });
      const data = await response.json();
      setAnswerResult(data.isCorrect);
      if (data.isCorrect) {
        alert(`¡Correcto! Ahora puedes leer "${booksData.find(b => b.id === bookId)?.title}"`);
        setIsBookBlocked(false); // Desbloquear el libro
        // TODO: Lógica para mostrar el contenido del libro desbloqueado
      } else {
        // El BookModal mostrará que la respuesta es incorrecta (si implementamos esa lógica allí)
      }
    } catch (error) {
      console.error('Error al verificar la respuesta:', error);
      alert('Error al verificar la respuesta. Inténtalo de nuevo.');
    }
  };

  if (booksError || searchError) {
    return <ErrorLoader />;
  }

  if (isBooksLoading) {
    return <RequestLoader />;
  }

  return (
    <div className="relative min-h-[calc(100vh-16rem)] p-4 overflow-y-auto">
      <BookSearch onSearch={setSearchTerm} />

      <div className="bg-shelf p-4 rounded-lg shadow-xl">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1 md:gap-2">
          {isSearching ? (
            <SearchBooksLoader />
          ) : displayedBooks.length === 0 ? (
            <BooksNotFound />
          ) : (
            displayedBooks.map((book) => (
              <BookSpine
                key={book.id}
                book={book}
                onClick={handleBookClick}
              />
            ))
          )}
        </div>
      </div>

      {activeBookData && (
        <BookModal
          isOpen={Boolean(activeBookData)}
          book={activeBookData}
          onClose={handleCloseModal}
          // ✅ Pasa isBlocked al BookModal
          isBlocked={isBookBlocked}
          // ✅ Pasa la función para manejar el envío de la respuesta
          onAnswerSubmit={handleAnswerSubmit}
        />
      )}
    </div>
  );
}