import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react"

import {
  API_ENDPOINTS,
  COOLDOWN_DURATION_MS,
  UNLOCK_DURATION_MS,
} from "../lib/constants"
import { fetcher, useCustomMutation } from "@/lib/utils"

// Context for managing book unlock state
const BookUnlockContext = createContext()

// Helper to safely remove corrupted local storage keys
const clearLocalStorage = (keys) => {
  keys.forEach((key) => {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error(`Error removing LS key ${key}:`, e)
    }
  })
}

export const BookUnlockProvider = ({ children }) => {
  // 🔒 Session-only state: unlocked books reset on page refresh
  const [booksUnlocked, setBooksUnlocked] = useState([])

  // 🔢 Persisted states: retry counts and cooldown end times
  const [retryCounts, setRetryCounts] = useState({})
  const [cooldownEndTimes, setCooldownEndTimes] = useState({})

  // --- STATE LOADING FROM LOCAL STORAGE ---
  useEffect(() => {
    let storedRetries = {}
    let storedCooldowns = {}

    // 🔄 Try to restore persisted states
    try {
      storedRetries = JSON.parse(localStorage.getItem("retryCounts") || "{}")
      storedCooldowns = JSON.parse(
        localStorage.getItem("cooldownEndTimes") || "{}"
      )
    } catch (error) {
      console.error("Error parsing state from localStorage:", error)
      clearLocalStorage(["retryCounts", "cooldownEndTimes"])
    }

    const now = Date.now()
    const validCooldowns = {}
    const validRetries = {}

    // 🔄 Process valid cooldowns and associated retry counts
    Object.entries(storedCooldowns).forEach(([bookId, endTime]) => {
      if (endTime > now) {
        validCooldowns[bookId] = endTime
        if (storedRetries[bookId] !== undefined) {
          validRetries[bookId] = storedRetries[bookId]
        }
      }
    })

    // 🔄 Process non-cooldown retry counts (under 3 attempts)
    Object.entries(storedRetries).forEach(([bookId, count]) => {
      if (
        !validCooldowns[bookId] && // Not in active cooldown
        count < 3 // Only keep counts below max attempts
      ) {
        validRetries[bookId] = count
      }
    })

    // 🔄 Update state with validated data
    setRetryCounts(validRetries)
    setCooldownEndTimes(validCooldowns)

    // ⏳ Restore cooldown timers for persisted cooldowns
    const cooldownTimers = Object.entries(validCooldowns).map(
      ([bookId, endTime]) => {
        const remainingTime = endTime - now
        return setTimeout(
          () => resetRetryCount(bookId),
          remainingTime > 0 ? remainingTime : 0
        )
      }
    )

    // 🛑 Cleanup timers on unmount
    return () => {
      cooldownTimers.forEach(clearTimeout)
    }
  }, [])

  // 🔄 Mutation hook for locking books (API)
  const { trigger: triggerLockMutation } = useCustomMutation(
    API_ENDPOINTS.LOCK_BOOK,
    {
      fetcher,
      method: "POST",
    }
  )

  // 🔒 Lock a book (remove from session state & optionally API)
  const lockBook = useCallback(
    async (bookId) => {
      // Update session state (not persisted)
      setBooksUnlocked((prev) => prev.filter((b) => b.bookId !== bookId))

      // 🔗 Optional API call to persist lock on server
      try {
        await triggerLockMutation({
          body: JSON.stringify({ book_id: bookId }), // Ensure API expects "book_id"
        })
      } catch (error) {
        console.error("API Lock book error:", error)
      }
    },
    [triggerLockMutation]
  )

  // 🔄 Reset retry count & cooldown for a book
  const resetRetryCount = useCallback((bookId) => {
    // 📦 Update retry counts in state & localStorage
    setRetryCounts((prev) => {
      const newRetries = { ...prev }
      delete newRetries[bookId]
      try {
        localStorage.setItem("retryCounts", JSON.stringify(newRetries))
      } catch (e) {
        console.error("LS Error:", e)
      }
      return newRetries
    })

    // 📦 Update cooldown times in state & localStorage
    setCooldownEndTimes((prev) => {
      const newCooldowns = { ...prev }
      delete newCooldowns[bookId]
      try {
        localStorage.setItem("cooldownEndTimes", JSON.stringify(newCooldowns))
      } catch (e) {
        console.error("LS Error:", e)
      }
      return newCooldowns
    })
  }, [])

  // 🚀 Unlock a book (session only)
  const unlockBook = useCallback(
    (bookId) => {
      const unlockTime = Date.now()
      const timerId = setTimeout(() => lockBook(bookId), UNLOCK_DURATION_MS)

      // 📦 Update session state (not persisted)
      setBooksUnlocked((prev) => {
        if (prev.some((b) => b.bookId === bookId)) return prev
        return [...prev, { bookId, unlockTime, timerId }]
      })

      // 🔄 Reset retries/cooldown after unlock (prevents leftover state)
      resetRetryCount(bookId)
    },
    [lockBook, resetRetryCount]
  )

  // ⚠️ Increment retry count and handle cooldown
  const incrementRetryCount = useCallback(
    (bookId) => {
      const newCount = (retryCounts[bookId] || 0) + 1
      const newRetries = { ...retryCounts, [bookId]: newCount }

      // 📦 Update retry count in state & localStorage
      setRetryCounts(newRetries)
      try {
        localStorage.setItem("retryCounts", JSON.stringify(newRetries))
      } catch (e) {
        console.error("LS Error:", e)
      }

      if (newCount >= 3) {
        const endTime = Date.now() + COOLDOWN_DURATION_MS
        const newCooldowns = { ...cooldownEndTimes, [bookId]: endTime }

        // 📦 Update cooldown end time in state & localStorage
        setCooldownEndTimes(newCooldowns)
        try {
          localStorage.setItem("cooldownEndTimes", JSON.stringify(newCooldowns))
        } catch (e) {
          console.error("LS Error:", e)
        }

        // ⏳ Schedule automatic retry reset after cooldown
        setTimeout(() => resetRetryCount(bookId), COOLDOWN_DURATION_MS)
      }
    },
    [retryCounts, cooldownEndTimes, resetRetryCount]
  )

  // 📦 Memoized context value
  const contextValue = useMemo(
    () => ({
      booksUnlocked,
      retryCounts,
      cooldownEndTimes,
      unlockBook,
      incrementRetryCount,
      resetRetryCount,
    }),
    [
      booksUnlocked,
      retryCounts,
      cooldownEndTimes,
      unlockBook,
      incrementRetryCount,
      resetRetryCount,
    ]
  )

  return (
    <BookUnlockContext.Provider value={contextValue}>
      {children}
    </BookUnlockContext.Provider>
  )
}

// 🔑 Hook to access context
export const useBookUnlock = () => {
  const context = useContext(BookUnlockContext)
  if (!context) {
    throw new Error("useBookUnlock must be used within a BookUnlockProvider")
  }
  return context
}
