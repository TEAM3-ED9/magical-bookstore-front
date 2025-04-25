import { COOLDOWN_DURATION_MS } from '@/lib/constants'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * @typedef {object} UnlockedBook
 * @property {string} bookId - The ID of the unlocked book.
 * @property {number} unlockTime - The timestamp (in milliseconds) when the book was unlocked.
 * @property {number|null} timerId - The ID of the timer associated with the unlock (currently unused).
 * @property {string} [description] - The description of the book (optional).
 */

/**
 * @typedef {object} BookUnlockContextValue
 * @property {UnlockedBook[]} booksUnlocked - An array of currently unlocked books.
 * @property {Record<string, number>} retryCounts - An object mapping book IDs to the number of failed unlock attempts.
 * @property {Record<string, number>} cooldownEndTimes - An object mapping book IDs to the timestamp (in milliseconds) when the cooldown period ends.
 * @property {function(string, string): void} unlockBook - A function to unlock a book, now accepts description.
 * @property {function(string): void} incrementRetryCount - A function to increment the retry count for a book and potentially start a cooldown.
 * @property {function(string): void} resetRetryCount - A function to reset the retry count and cooldown for a book.
 * @property {function(string, string): void} storeBookDescription - Function to store book description.
 */

/**
 * Context for managing the unlock state of books.
 * @type {import('react').Context<BookUnlockContextValue | undefined>}
 */
const BookUnlockContext = createContext(undefined)

/**
 * Helper function to safely remove corrupted local storage keys.
 * It wraps the `localStorage.removeItem` call in a try-catch block to prevent errors from invalid data.
 *
 * @param {string[]} keys - An array of keys to attempt to remove from local storage.
 * @returns {void}
 */
const clearLocalStorage = (keys) => {
  keys.forEach((key) => {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error(`Error removing LS key ${key}:`, e)
    }
  })
}

/**
 * Provides the book unlock management functionality to its children.
 * It manages the state of unlocked books, retry counts for unlocking, and cooldown periods.
 *
 * @param {object} props - The component's props.
 * @param {React.ReactNode} props.children - The child components that will have access to the context.
 * @param {string[]} [props.defaultUnlockedBookIds=[]] - An array of book IDs that should be initially marked as unlocked.
 * @returns {React.ReactElement} The BookUnlockContext provider.
 */
/**
 * Provides context for managing the unlocking of books, including retry counts, cooldowns, and descriptions.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render within the provider.
 * @param {string[]} [props.defaultUnlockedBookIds=[]] - An array of book IDs that should be unlocked by default.
 * @returns {React.ReactElement} The provider component that wraps its children with the book unlock context.
 */
export const BookUnlockProvider = ({ children, defaultUnlockedBookIds = [] }) => {
  /**
   * An array of objects representing the currently unlocked books.
   * @type {[UnlockedBook[], Function]} booksUnlocked and its setter
   */
  const [booksUnlocked, setBooksUnlocked] = useState([])

  /**
   * State storing the number of failed unlock attempts for each book.
   * @type {Array} A tuple containing:
   * - [0]: {Object.<string, number>} The retry counts (keys: book IDs, values: counts)
   * - [1]: {Function} The state setter function
   */
  const [retryCounts, setRetryCounts] = useState(() => {
    try {
      const storedRetries = localStorage.getItem('retryCounts')
      return storedRetries ? JSON.parse(storedRetries) : {}
    } catch (error) {
      console.error('Error parsing retryCounts from localStorage:', error)
      clearLocalStorage(['retryCounts'])
      return {}
    }
  })

  /**
   * An object storing the timestamps (in milliseconds) when the cooldown period ends for each book.
   * The keys are book IDs, and the values are the end times.
   * This state is persisted in local storage.
   * @type {Array} A tuple containing:
   * - [0]: {Object.<string, number>} The retry counts (keys: book IDs, values: counts)
   * - [1]: {Function} The state setter function
   */
  const [cooldownEndTimes, setCooldownEndTimes] = useState(() => {
    try {
      const storedCooldowns = localStorage.getItem('cooldownEndTimes')
      return storedCooldowns ? JSON.parse(storedCooldowns) : {}
    } catch (error) {
      console.error('Error parsing cooldownEndTimes from localStorage:', error)
      clearLocalStorage(['cooldownEndTimes'])
      return {}
    }
  })

  /**
   * Stores the description of a book.  This function updates the `booksUnlocked`
   * state to include the description.  If the book is already unlocked, it
   * updates the existing entry; otherwise, it does *not* unlock the book.
   *
   * @param {string} bookId - The ID of the book.
   * @param {string} description - The description of the book.
   * @returns {void}
   */
  const storeBookDescription = useCallback((bookId, description) => {
    setBooksUnlocked((prevBooks) => {
      const existingBookIndex = prevBooks.findIndex((book) => book.bookId === bookId)
      if (existingBookIndex > -1) {
        // Update existing book entry
        const updatedBooks = [...prevBooks]
        updatedBooks[existingBookIndex] = {
          ...updatedBooks[existingBookIndex],
          description
        }
        return updatedBooks
      } else {
        // Book not unlocked, add only description.
        return prevBooks // Important:  Do not add a new unlocked book here.
      }
    })
  }, [])

  /**
   * Resets the retry count and clears the cooldown end time for a specific book.
   * Updates the local storage accordingly.
   *
   * @type {function(string): void}
   */
  const resetRetryCount = useCallback((bookId) => {
    setRetryCounts((prev) => {
      const newRetries = { ...prev }
      delete newRetries[bookId]
      try {
        localStorage.setItem('retryCounts', JSON.stringify(newRetries))
      } catch (e) {
        console.error('LS Error:', e)
      }
      return newRetries
    })

    setCooldownEndTimes((prev) => {
      const newCooldowns = { ...prev }
      delete newCooldowns[bookId]
      try {
        localStorage.setItem('cooldownEndTimes', JSON.stringify(newCooldowns))
      } catch (e) {
        console.error('LS Error:', e)
      }
      return newCooldowns
    })
  }, [])

  // Initialize default unlocked books
  useEffect(() => {
    setBooksUnlocked((prev) => {
      const newUnlocked = [...prev]
      defaultUnlockedBookIds.forEach((bookId) => {
        if (!newUnlocked.some((b) => b.bookId === bookId)) {
          newUnlocked.push({ bookId, unlockTime: Date.now(), timerId: null, description: '' }) // Added description
        }
      })
      return newUnlocked
    })
  }, [defaultUnlockedBookIds])

  // Set up timers to reset retry counts when cooldowns expire
  useEffect(() => {
    const now = Date.now()
    const cooldownTimers = Object.entries(cooldownEndTimes).map(([bookId, endTime]) => {
      const remainingTime = endTime - now
      return setTimeout(() => resetRetryCount(bookId), remainingTime > 0 ? remainingTime : 0)
    })

    return () => {
      cooldownTimers.forEach(clearTimeout)
    }
  }, [cooldownEndTimes, resetRetryCount])

  /**
   * Unlocks a book by adding its ID to the `booksUnlocked` state and resetting its retry count.
   *
   * @type {function(string, string): void}
   */
  const unlockBook = useCallback(
    (bookId, description = '') => {
      // added description
      const unlockTime = Date.now()
      setBooksUnlocked((prev) => {
        if (prev.some((b) => b.bookId === bookId)) return prev
        return [...prev, { bookId, unlockTime, timerId: null, description }] // Added description
      })
      resetRetryCount(bookId)
    },
    [resetRetryCount]
  )

  /**
   * Increments the retry count for a book. If the retry count reaches a threshold,
   * it initiates a cooldown period for that book.
   *
   * @type {function(string): void}
   */
  const incrementRetryCount = useCallback(
    (bookId) => {
      const newCount = (retryCounts[bookId] || 0) + 1
      const newRetries = { ...retryCounts, [bookId]: newCount }

      setRetryCounts(newRetries)
      try {
        localStorage.setItem('retryCounts', JSON.stringify(newRetries))
      } catch (e) {
        console.error('LS Error:', e)
      }

      if (newCount >= 3) {
        const endTime = Date.now() + COOLDOWN_DURATION_MS
        const newCooldowns = { ...cooldownEndTimes, [bookId]: endTime }

        setCooldownEndTimes(newCooldowns)
        try {
          localStorage.setItem('cooldownEndTimes', JSON.stringify(newCooldowns))
        } catch (e) {
          console.error('LS Error:', e)
        }

        setTimeout(() => resetRetryCount(bookId), COOLDOWN_DURATION_MS)
      }
    },
    [retryCounts, cooldownEndTimes, resetRetryCount]
  )

  /**
   * The value provided by the context, containing the state and functions for managing book unlock status.
   * @type {BookUnlockContextValue}
   */
  const contextValue = useMemo(
    () => ({
      booksUnlocked,
      retryCounts,
      cooldownEndTimes,
      unlockBook,
      incrementRetryCount,
      resetRetryCount,
      storeBookDescription // Added storeBookDescription to the context value
    }),
    [
      booksUnlocked,
      retryCounts,
      cooldownEndTimes,
      unlockBook,
      incrementRetryCount,
      resetRetryCount,
      storeBookDescription
    ] //Added storeBookDescription
  )

  return <BookUnlockContext.Provider value={contextValue}>{children}</BookUnlockContext.Provider>
}

/**
 * Custom hook to access the book unlock context.
 *
 * @returns {BookUnlockContextValue} The context value containing book unlock state and management functions.
 * @throws {Error} If the hook is used outside of a `BookUnlockProvider`.
 */
export const useBookUnlock = () => {
  const context = useContext(BookUnlockContext)
  if (!context) {
    throw new Error('useBookUnlock must be used within a BookUnlockProvider')
  }
  return context
}
