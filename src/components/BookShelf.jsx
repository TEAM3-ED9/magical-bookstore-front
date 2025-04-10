import { useCallback, useEffect, useMemo, useState } from "react"
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

const queryUrl = `${BACKEND_URL}/books`

/**
 * TODO
 *
 * Fix error when the query belongs to title or author and the other query fails
 */
export default function BookShelf() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeBook, setActiveBook] = useState(null)
  const [filteredBooks, setFilteredBooks] = useState([])
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })

  const {
    data: booksData,
    error: booksError,
    isLoading: booksLoading,
  } = useSWR(queryUrl, fetcher, {
    errorRetryInterval: 5000,
  })

  const search = searchTerm?.toLowerCase() ?? ""
  const authorQuery = `${queryUrl}/author?author=${search}`
  const titleQuery = `${queryUrl}/title?title=${search}`

  const {
    data: booksFilteredByAuthorData,
    error: authorError,
    isLoading: authorLoading,
  } = useSWR(search ? authorQuery : null, fetcher, {
    errorRetryInterval: 5000,
  })

  const {
    data: booksFilteredByTitleData,
    error: titleError,
    isLoading: titleLoading,
  } = useSWR(search ? titleQuery : null, fetcher, {
    errorRetryInterval: 5000,
  })

  const hasError = booksError || authorError || titleError
  const isLoading = booksLoading
  const isLoadingBooks = titleLoading || authorLoading

  const activeBookData = useMemo(() => {
    if (!booksData || !activeBook) return null
    return booksData.find((b) => b.id === activeBook)
  }, [booksData, activeBook])

  const handleBookHover = useCallback((id, e) => {
    const rect = e.currentTarget.getBoundingClientRect()

    setActiveBook(id)
    setPopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
  }, [])

  const handleBookLeave = () => {
    setActiveBook(null)
  }

  useEffect(() => {
    if (!searchTerm) {
      setFilteredBooks(booksData || [])
      return
    }

    const validAuthorResults = Array.isArray(booksFilteredByAuthorData)
      ? booksFilteredByAuthorData
      : []

    const validTitleResults = Array.isArray(booksFilteredByTitleData)
      ? booksFilteredByTitleData
      : []

    const combinedResults = [...validAuthorResults, ...validTitleResults]

    const uniqueResults = [
      ...new Map(combinedResults.map((book) => [book.id, book])).values(),
    ]

    setFilteredBooks(uniqueResults)
  }, [
    searchTerm,
    booksData,
    booksFilteredByAuthorData,
    booksFilteredByTitleData,
  ])

  return (
    <div className="relative min-h-[calc(100vh-16rem)]">
      {hasError ? (
        <ErrorLoader />
      ) : isLoading ? (
        <RequestLoader />
      ) : (
        <>
          <BookSearch setSearch={setSearchTerm} />
          <div className="bg-[#5D4037] p-4 rounded-lg shadow-xl">
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-1 md:gap-2">
              {isLoadingBooks ? (
                <SearchBooksLoader />
              ) : filteredBooks.length === 0 ? (
                <BooksNotFound />
              ) : (
                filteredBooks?.length > 0 &&
                filteredBooks.map((book) => (
                  <BookSpine
                    key={book.id}
                    book={book}
                    onMouseEnter={(e) => handleBookHover(book.id, e)}
                    onMouseLeave={handleBookLeave}
                  />
                ))
              )}
            </div>
          </div>
          {activeBook !== null && activeBookData && (
            <BookPopup
              book={activeBookData}
              position={popupPosition}
            />
          )}
        </>
      )}
    </div>
  )
}
