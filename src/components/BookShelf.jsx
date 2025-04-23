import { useMemo, useState, useCallback } from "react"
import useSWR from "swr"
import BookSpine from "@/components/BookSpine"
import BookSearch from "@/components/molecules/BookSearch"
import { fetcher } from "@/lib/utils"
import {
  BOOKS_PER_SHELF,
  API_ENDPOINTS,
  SWR_OPTIONS,
  SEARCH_SWR_OPTIONS,
} from "@/lib/constants"
import ErrorLoader from "./molecules/ErrorLoader"
import RequestLoader from "./molecules/RequestLoader"
import SearchBooksLoader from "./molecules/SearchBooksLoader"
import BooksNotFound from "./molecules/BooksNotFound"
import { useDebounce } from "../hooks/useDebounce"
import BookModal from "./BookModal"
import { useQueryState } from "nuqs"
import JumpscareLoader from "./molecules/JumpscareLoader"

export default function BookShelf({ onSendMessage }) {
  const [filterParam, setFilterParam] = useQueryState("filter", {
    defaultValue: "title",
  })
  const [searchTerm, setSearchTerm] = useQueryState("search")
  const [activeBookId, setActiveBookId] = useState(null)
  const [showJumpscare, setShowJumpscare] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const {
    data: booksData,
    error: booksError,
    isLoading: isBooksLoading,
  } = useSWR(API_ENDPOINTS.BOOKS, fetcher, SWR_OPTIONS)

  const searchQuery = useMemo(() => {
    if (!debouncedSearchTerm) return null
    const encodedTerm = encodeURIComponent(debouncedSearchTerm)
    if (filterParam === "author") {
      return `${API_ENDPOINTS.AUTHOR_SEARCH}?author=${encodedTerm}`
    }
    if (filterParam === "title") {
      return `${API_ENDPOINTS.TITLE_SEARCH}?title=${encodedTerm}`
    }
    return null
  }, [debouncedSearchTerm, filterParam])

  const {
    data: searchResults,
    error: searchError,
    isLoading: isSearching,
  } = useSWR(searchQuery, fetcher, SEARCH_SWR_OPTIONS)

  const displayedBooks = useMemo(() => {
    if (isSearching) return []
    if (!debouncedSearchTerm) return booksData || []
    if (!searchResults || searchResults?.message?.includes("No books found"))
      return []

    const uniqueBooks = new Map()
    searchResults.forEach((book) => {
      if (
        book?.id &&
        book?.title &&
        book?.author &&
        !uniqueBooks.has(book.id)
      ) {
        uniqueBooks.set(book.id, book)
      }
    })
    return Array.from(uniqueBooks.values())
  }, [booksData, debouncedSearchTerm, searchResults, isSearching])

  const activeBookData = useMemo(() => {
    if (!booksData || !activeBookId) return null
    const source = displayedBooks.length > 0 ? displayedBooks : booksData
    return source.find((book) => book.id === activeBookId)
  }, [booksData, displayedBooks, activeBookId])

  const handleBookClick = useCallback((bookId) => {
    setActiveBookId(bookId)
  }, [])

  const handleCloseModal = useCallback(() => {
    setActiveBookId(null)
  }, [])

  const handleMaxFailedAttempts = useCallback(() => {
    setShowJumpscare(true)
  }, [setShowJumpscare])

  const bookShelves = useMemo(() => {
    if (!displayedBooks.length) return []
    const shelves = []
    const numBooks = displayedBooks.length
    for (let i = 0; i < numBooks; i += BOOKS_PER_SHELF) {
      shelves.push(displayedBooks.slice(i, i + BOOKS_PER_SHELF))
    }
    return shelves
  }, [displayedBooks])

  if (booksError || searchError) return <ErrorLoader />
  if (isBooksLoading) return <RequestLoader />

  return (
    <div className="relative min-h-[calc(100vh-16rem)] p-4 overflow-y-auto">
      <BookSearch
        onSearch={setSearchTerm}
        onFilter={setFilterParam}
        filter={filterParam}
        search={searchTerm || ""}
      />

      <div className="flex flex-col items-center mt-20">
        {/* Shelf rendering logic (unchanged) */}
        {displayedBooks.length > 0 &&
          bookShelves.map((shelf, shelfIndex) => (
            <div
              key={shelfIndex}
              className="relative w-full max-w-6xl -mb-3"
            >
              {/* Shelf structure */}
              <div className="absolute -top-4 left-0 right-0 h-7 bg-brown-500 rounded-t-md z-10 bg-amber-800 border border-black"></div>
              <div className="absolute bottom-0 left-0 right-0 h-7 bg-amber-800 rounded-b-md z-10 border border-black"></div>
              <div className="absolute -top-4 -left-7 bottom-0 w-12 bg-amber-800 rounded-l-md "></div>
              <div className="absolute -top-4 -right-7 bottom-0 w-12 bg-amber-800 rounded-r-md"></div>

              {/* Books */}
              <div className="relative p-4 rounded-b-md shadow-lg bg-gray-900">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                  {shelf.map((book) => (
                    <BookSpine
                      key={book.id}
                      book={book}
                      onClick={() => handleBookClick(book.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}

        {/* Loading/Not Found logic (unchanged) */}
        {isSearching && (
          <div className="relative w-full max-w-6xl mt-4">
            <div className="absolute -top-4 left-0 right-0 h-4 bg-amber-900 rounded-t-md"></div>
            <div className="bg-amber-100 p-8 rounded-b-md shadow-lg">
              <SearchBooksLoader />
            </div>
          </div>
        )}
        {!isSearching && displayedBooks.length === 0 && (
          <div className="relative w-full max-w-6xl mt-4">
            <div className="absolute -top-4 left-0 right-0 h-4 bg-amber-900 rounded-t-md"></div>
            <div className="bg-amber-100 p-8 rounded-b-md shadow-lg">
              <BooksNotFound />
            </div>
          </div>
        )}
      </div>

      {/* Render modal only when there's active book data */}
      {activeBookData && (
        <BookModal
          key={activeBookData.id}
          isOpen={Boolean(activeBookData)}
          book={activeBookData}
          onClose={handleCloseModal}
          onMaxFailedAttempts={handleMaxFailedAttempts}
          onSendMessage={onSendMessage}
        />
      )}

      {showJumpscare && (
        <JumpscareLoader
          onButtonClick={() => {
            setShowJumpscare(false)
          }}
        />
      )}
    </div>
  )
}
