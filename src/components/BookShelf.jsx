import { useMemo, useState } from "react"
import useSWR from "swr"
import BookSpine from "@/components/BookSpine"
import BookSearch from "@/components/molecules/BookSearch"
import { BACKEND_URL } from "@/lib/constants"
import { fetcher } from "@/lib/utils"
import ErrorLoader from "./molecules/ErrorLoader"
import RequestLoader from "./molecules/RequestLoader"
import SearchBooksLoader from "./molecules/SearchBooksLoader"
import BooksNotFound from "./molecules/BooksNotFound"
import BookModal from "./BookModal"

/**
 * TODO
 * Fix error when the query belongs to title or author and the other query fails
 */

const API_ENDPOINTS = {
  BOOKS: `${BACKEND_URL}/books`,
  TITLE_SEARCH: `${BACKEND_URL}/books/title`,
  AUTHOR_SEARCH: `${BACKEND_URL}/books/author`,
}

const SWR_OPTIONS = {
  errorRetryInterval: 3000,
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    if (retryCount >= 5) return
    setTimeout(() => revalidate({ retryCount }), 5000)
  },
}

const SEARCH_SWR_OPTIONS = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  errorRetryCount: 3,
}

export default function BookShelf() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeBookId, setActiveBookId] = useState(null)

  const {
    data: booksData,
    error: booksError,
    isLoading: isBooksLoading,
  } = useSWR(API_ENDPOINTS.BOOKS, fetcher, SWR_OPTIONS)

  const searchQueries = useMemo(() => {
    if (!searchTerm.trim()) return null
    return [
      `${API_ENDPOINTS.TITLE_SEARCH}?title=${encodeURIComponent(searchTerm)}`,
      `${API_ENDPOINTS.AUTHOR_SEARCH}?author=${encodeURIComponent(searchTerm)}`,
    ]
  }, [searchTerm])

  const {
    data: searchResults,
    error: searchError,
    isLoading: isSearching,
  } = useSWR(
    searchQueries,
    (urls) => Promise.all(urls.map(fetcher)),
    SEARCH_SWR_OPTIONS
  )

  const displayedBooks = useMemo(() => {
    if (!booksData) return []
    if (!searchTerm.trim()) return booksData
    if (!searchResults) return []

    // Process and deduplicate search results
    return searchResults
      .flat()
      .filter((result) => result?.id && result?.title && result?.author)
      .reduce((uniqueBooks, book) => {
        if (!uniqueBooks.some((b) => b.id === book.id)) {
          uniqueBooks.push(book)
        }
        return uniqueBooks
      }, [])
  }, [booksData, searchTerm, searchResults])

  const activeBookData = useMemo(() => {
    if (!booksData || !activeBookId) return null
    return booksData.find((book) => book.id === activeBookId)
  }, [booksData, activeBookId])

  const handleBookClick = (bookId) => {
    setActiveBookId(bookId)
  }

  const handleCloseModal = () => {
    setActiveBookId(null)
  }

  if (booksError || searchError) {
    return <ErrorLoader />
  }

  if (isBooksLoading) {
    return <RequestLoader />
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

      <BookModal
        isOpen={Boolean(activeBookData)}
        book={activeBookData}
        onClose={handleCloseModal}
      />
    </div>
  )
}
