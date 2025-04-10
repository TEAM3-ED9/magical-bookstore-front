import { useCallback, useMemo, useState } from "react"
import BookSpine from "@/components/BookSpine"
import BookPopup from "@/components/BookPopup"
import BookSearch from "@/components/molecules/BookSearch"
import useSWR from "swr"
import { BACKEND_URL } from "@/lib/constants"
import { fetcher } from "@/lib/utils"
import ErrorLoader from "./molecules/ErrorLoader"
import RequestLoader from "./molecules/RequestLoader"
import SearchBooksLoader from "./molecules/SearchBooksLoader"
import BooksNotFound from "./molecules/BooksNotFound"

const BOOKS_URL = `${BACKEND_URL}/books`
const TITLE_SEARCH_URL = `${BACKEND_URL}/books/title`
const AUTHOR_SEARCH_URL = `${BACKEND_URL}/books/author`

export default function BookShelf() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeBook, setActiveBook] = useState(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [finalRetry, setFinalRetry] = useState(false)

  const {
    data: booksData,
    error: booksError,
    isLoading: booksLoading,
  } = useSWR(BOOKS_URL, fetcher, {
    errorRetryInterval: 3000,
    onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
      if (retryCount >= 5) {
        if (!finalRetry) setFinalRetry(true)
        return
      }
      setTimeout(() => revalidate({ retryCount }), 5000)
    },
  })

  const searchQueries = useMemo(() => {
    if (!searchTerm) return null
    return [
      `${TITLE_SEARCH_URL}?title=${encodeURIComponent(searchTerm)}`,
      `${AUTHOR_SEARCH_URL}?author=${encodeURIComponent(searchTerm)}`,
    ]
  }, [searchTerm])

  const {
    data: searchResults,
    error: searchError,
    isLoading: isSearching,
  } = useSWR(
    searchQueries,
    (urls) => Promise.all(urls.map((url) => fetcher(url))),
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      errorRetryCount: 3,
    }
  )

  const hasError = booksError || searchError
  const isLoading = booksLoading
  const isLoadingBooks = isSearching

  const displayedBooks = useMemo(() => {
    if (!booksData) return []
    if (!searchTerm) return booksData
    if (!searchResults) return []

    const validResults = searchResults.flat().filter((result) => {
      return (
        result &&
        typeof result === "object" &&
        result.id &&
        result.title &&
        result.author
      )
    })

    const uniqueResultsMap = new Map()
    validResults.forEach((book) => {
      if (!uniqueResultsMap.has(book.id)) {
        uniqueResultsMap.set(book.id, book)
      }
    })

    return Array.from(uniqueResultsMap.values())
  }, [booksData, searchTerm, searchResults])

  const activeBookData = useMemo(() => {
    if (!booksData || !activeBook) return null
    return booksData.find((b) => b.id === activeBook)
  }, [booksData, activeBook])

  const handleBookHover = useCallback((id, e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const popupWidth = 200
    const popupHeight = 200
    const margin = 10

    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    let x = rect.left + rect.width / 2
    let y = rect.top / 3

    if (x - popupWidth / 2 < margin) {
      x = margin + popupWidth / 1.5
    } else if (x + popupWidth / 2 > windowWidth - margin) {
      x = windowWidth - margin - popupWidth / 1.5
    }

    if (y < margin) {
      y = rect.bottom + 10

      if (y + popupHeight > windowHeight - margin) {
        y = windowHeight - popupHeight - margin
      }
    }

    setActiveBook(id)
    setPopupPosition({ x, y })
  }, [])

  return (
    <div className="relative min-h-[calc(100vh-16rem)] p-4 overflow-y-auto">
      {hasError ? (
        <ErrorLoader finalRetry={finalRetry} />
      ) : isLoading ? (
        <RequestLoader />
      ) : (
        <>
          <BookSearch setSearch={setSearchTerm} />
          <div className="bg-shelf p-4 rounded-lg shadow-xl">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1 md:gap-2">
              {isLoadingBooks ? (
                <SearchBooksLoader />
              ) : displayedBooks.length === 0 ? (
                <BooksNotFound />
              ) : (
                displayedBooks.map((book) => (
                  <BookSpine
                    key={book.id}
                    book={book}
                    onMouseEnter={(e) => handleBookHover(book.id, e)}
                    onMouseLeave={() => setActiveBook(null)}
                  />
                ))
              )}
            </div>
          </div>
          {activeBookData && (
            <BookPopup
              book={activeBookData}
              position={popupPosition}
              unlocked={activeBookData.status === 0}
            />
          )}
        </>
      )}
    </div>
  )
}
