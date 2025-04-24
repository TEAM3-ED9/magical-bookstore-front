import BookModal from '@/components/BookModal'
import BookSpine from '@/components/BookSpine'
import BookSearch from '@/components/molecules/BookSearch'
import BooksNotFound from '@/components/molecules/BooksNotFound'
import ErrorLoader from '@/components/molecules/ErrorLoader'
import JumpscareLoader from '@/components/molecules/JumpscareLoader'
import RequestLoader from '@/components/molecules/RequestLoader'
import SearchBooksLoader from '@/components/molecules/SearchBooksLoader'
import { BookUnlockProvider } from '@/contexts/BookUnlock'
import { useDebounce } from '@/hooks/useDebounce'
import { API_ENDPOINTS, BOOKS_PER_SHELF, SEARCH_SWR_OPTIONS, SWR_OPTIONS } from '@/lib/constants'
import { fetcher } from '@/lib/utils'
import { useQueryState } from 'nuqs'
import { useCallback, useMemo, useState } from 'react'
import useSWR from 'swr'

/**
 * Renders a bookshelf displaying books with search and unlock capabilities.
 *
 * @param {object} props - The component's props.
 * @param {function(string|null): void} props.onSendMessage - Callback to send messages (e.g., to a guide).
 * @returns {React.ReactElement} The BookShelf component.
 */
export default function BookShelf({ onSendMessage }) {
  /**
   * State to store the IDs of books that are initially unlocked.
   * @type {ReturnType<typeof useState<string[]>>}
   */
  const [initialUnlockedIds, setInitialUnlockedIds] = useState([])

  /**
   * Query state for the current filter applied to the search ('title' or 'author').
   * @type {ReturnType<typeof useQueryState<'title' | 'author'>>}
   */
  const [filterParam, setFilterParam] = useQueryState('filter', {
    defaultValue: 'title',
    parse: (value) => (value === 'author' ? 'author' : 'title'),
    serialize: (value) => value
  })

  /**
   * Query state for the current search term entered by the user.
   * @type {[string|undefined, function(string|undefined): void]}
   */
  const [searchTerm, setSearchTerm] = useQueryState('search')

  /**
   * State to hold the ID of the currently selected book, used to display the modal.
   * @type {ReturnType<typeof useState<string|null>>}
   */
  const [activeBookId, setActiveBookId] = useState(null)

  /**
   * State to control the visibility of the jumpscare loader component.
   * @type {ReturnType<typeof useState<boolean>>}
   */
  const [showJumpscare, setShowJumpscare] = useState(false)

  /**
   * Debounced version of the search term to delay API calls while the user is typing.
   * @type {string|undefined}
   */
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  /**
   * Fetches the initial list of all books using the SWR hook.
   * @type {object}
   * @property {Array<object>} data - The fetched books data.
   * @property {Error|undefined} error - Any error that occurred during the fetch.
   * @property {boolean} isLoading - Indicates if the data is currently being loaded.
   */
  const {
    data: booksData,
    error: booksError,
    isLoading: isBooksLoading
  } = useSWR(API_ENDPOINTS.BOOKS, fetcher, SWR_OPTIONS)

  /**
   * Memoizes the extraction of initially unlocked book IDs from the fetched `booksData`.
   */
  useMemo(() => {
    if (!booksData?.length) return
    const unlockedIds = booksData.filter((book) => book.status === 0).map((book) => book.id)
    setInitialUnlockedIds(unlockedIds)
  }, [booksData])

  /**
   * Memoizes the construction of the search query URL based on the filter and search term.
   * @type {string|null}
   */
  const searchQuery = useMemo(() => {
    if (!debouncedSearchTerm) return null
    const encodedTerm = encodeURIComponent(debouncedSearchTerm)
    if (filterParam === 'author') {
      return `${API_ENDPOINTS.AUTHOR_SEARCH}?author=${encodedTerm}`
    }
    if (filterParam === 'title') {
      return `${API_ENDPOINTS.TITLE_SEARCH}?title=${encodedTerm}`
    }
    return null
  }, [debouncedSearchTerm, filterParam])

  /**
   * Fetches search results based on the `searchQuery` using the SWR hook.
   * @type {object}
   * @property {Array<object>} data - The search results data.
   * @property {Error|undefined} error - Any error during the search fetch.
   * @property {boolean} isLoading - Indicates if the search is currently loading.
   */
  const { data: searchResults, isLoading: isSearching } = useSWR(
    searchQuery,
    fetcher,
    SEARCH_SWR_OPTIONS
  )

  /**
   * Memoizes the list of books to be displayed, considering search results and initial data.
   * @type {Array<object>}
   */
  const displayedBooks = useMemo(() => {
    if (isSearching) return []
    if (!debouncedSearchTerm) return booksData || []
    if (!searchResults || searchResults?.message?.includes('No books found')) return []

    const uniqueBooks = new Map()
    searchResults.forEach((book) => {
      if (book?.id && book?.title && book?.author && !uniqueBooks.has(book.id)) {
        uniqueBooks.set(book.id, book)
      }
    })
    return Array.from(uniqueBooks.values())
  }, [booksData, debouncedSearchTerm, searchResults, isSearching])

  /**
   * Memoizes the data of the currently active book based on `activeBookId`.
   * @type {object|null}
   */
  const activeBookData = useMemo(() => {
    if (!booksData || !activeBookId) return null
    const source = displayedBooks.length > 0 ? displayedBooks : booksData
    return source.find((book) => book.id === activeBookId)
  }, [booksData, displayedBooks, activeBookId])

  /**
   * Callback function to set the `activeBookId` when a book spine is clicked.
   * @type {function(string): void}
   */
  const handleBookClick = useCallback((bookId) => {
    setActiveBookId(bookId)
  }, [])

  /**
   * Callback function to reset `activeBookId` to null, closing the book modal.
   * @type {function(): void}
   */
  const handleCloseModal = useCallback(() => {
    setActiveBookId(null)
  }, [])

  /**
   * Callback function to set `showJumpscare` to true when the maximum unlock attempts are reached.
   * @type {function(): void}
   */
  const handleMaxFailedAttempts = useCallback(() => {
    setShowJumpscare(true)
  }, [setShowJumpscare])

  /**
   * Memoizes the arrangement of `displayedBooks` into shelves based on `BOOKS_PER_SHELF`.
   * @type {Array<Array<object>>}
   */
  const bookShelves = useMemo(() => {
    if (!displayedBooks.length) return []
    const shelves = []
    const numBooks = displayedBooks.length
    for (let i = 0; i < numBooks; i += BOOKS_PER_SHELF) {
      shelves.push(displayedBooks.slice(i, i + BOOKS_PER_SHELF))
    }
    return shelves
  }, [displayedBooks])

  // Render an error loader if there was an issue fetching books or search results
  if (booksError) return <ErrorLoader finalRetry={false} />
  // Render a request loader while the initial book data is being fetched
  if (isBooksLoading) return <RequestLoader />

  return (
    <BookUnlockProvider defaultUnlockedBookIds={initialUnlockedIds}>
      <div className='relative min-h-[calc(100vh-16rem)] p-4'>
        {/* Component for searching books */}
        <BookSearch
          onSearch={setSearchTerm}
          onFilter={setFilterParam}
          filter={filterParam}
          search={searchTerm || ''}
        />

        <div className='flex flex-col items-center mt-20'>
          {/* Render the book shelves */}
          {displayedBooks.length > 0 &&
            bookShelves.map((shelf, shelfIndex) => (
              <div
                key={shelfIndex}
                className='relative w-full max-w-6xl -mb-3'
              >
                {/* Visual representation of the shelf top */}
                <div className='absolute -top-4 left-0 right-0 h-7 bg-brown-500 rounded-t-md z-10 bg-amber-800 border border-black'></div>
                {/* Visual representation of the shelf bottom */}
                <div className='absolute bottom-0 left-0 right-0 h-7 bg-amber-800 rounded-b-md z-10 border border-black'></div>
                {/* Visual representation of the left shelf support */}
                <div className='absolute -top-4 -left-7 bottom-0 w-12 bg-amber-800 rounded-l-md '></div>
                {/* Visual representation of the right shelf support */}
                <div className='absolute -top-4 -right-7 bottom-0 w-12 bg-amber-800 rounded-r-md'></div>

                {/* Container for the book spines on the shelf */}
                <div className='relative p-4 rounded-b-md shadow-lg bg-neutral-900'>
                  <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3'>
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

          {/* Display loader while searching */}
          {isSearching && (
            <div className='relative w-full max-w-6xl mt-4'>
              <div className='absolute -top-4 left-0 right-0 h-4 bg-amber-900 rounded-t-md'></div>
              <div className='bg-shelf p-8 rounded-b-md shadow-lg'>
                <SearchBooksLoader />
              </div>
            </div>
          )}
          {/* Display "no books found" message if search returns no results */}
          {!isSearching && displayedBooks.length === 0 && (
            <div className='relative w-full max-w-6xl mt-4'>
              <div className='absolute -top-4 left-0 right-0 h-4 bg-amber-900 rounded-t-md'></div>
              <div className='bg-shelf p-8 rounded-b-md shadow-lg'>
                <BooksNotFound />
              </div>
            </div>
          )}
        </div>

        {/* Render the modal for the active book */}
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

        {/* Render the jumpscare loader on max failed attempts */}
        {showJumpscare && (
          <JumpscareLoader
            onButtonClick={() => {
              setShowJumpscare(false)
            }}
          />
        )}
      </div>
    </BookUnlockProvider>
  )
}
