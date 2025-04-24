import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react"

import { COOLDOWN_DURATION_MS } from "../lib/constants"

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

export const BookUnlockProvider = ({
  children,
  defaultUnlockedBookIds = [],
}) => {
  const [booksUnlocked, setBooksUnlocked] = useState([])
  const [retryCounts, setRetryCounts] = useState(() => {
    try {
      const storedRetries = localStorage.getItem("retryCounts")
      return storedRetries ? JSON.parse(storedRetries) : {}
    } catch (error) {
      console.error("Error parsing retryCounts from localStorage:", error)
      clearLocalStorage(["retryCounts"])
      return {}
    }
  })
  const [cooldownEndTimes, setCooldownEndTimes] = useState(() => {
    try {
      const storedCooldowns = localStorage.getItem("cooldownEndTimes")
      return storedCooldowns ? JSON.parse(storedCooldowns) : {}
    } catch (error) {
      console.error("Error parsing cooldownEndTimes from localStorage:", error)
      clearLocalStorage(["cooldownEndTimes"])
      return {}
    }
  })

  useEffect(() => {
    setBooksUnlocked((prev) => {
      const newUnlocked = [...prev]
      defaultUnlockedBookIds.forEach((bookId) => {
        if (!newUnlocked.some((b) => b.bookId === bookId)) {
          newUnlocked.push({ bookId, unlockTime: Date.now(), timerId: null })
        }
      })
      return newUnlocked
    })
  }, [defaultUnlockedBookIds])

  useEffect(() => {
    const now = Date.now()
    const cooldownTimers = Object.entries(cooldownEndTimes).map(
      ([bookId, endTime]) => {
        const remainingTime = endTime - now
        return setTimeout(
          () => resetRetryCount(bookId),
          remainingTime > 0 ? remainingTime : 0
        )
      }
    )

    return () => {
      cooldownTimers.forEach(clearTimeout)
    }
  }, [])

  const resetRetryCount = useCallback((bookId) => {
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

  const unlockBook = useCallback(
    (bookId) => {
      const unlockTime = Date.now()
      setBooksUnlocked((prev) => {
        if (prev.some((b) => b.bookId === bookId)) return prev
        return [...prev, { bookId, unlockTime, timerId: null }]
      })
      resetRetryCount(bookId)
    },
    [resetRetryCount]
  )

  const incrementRetryCount = useCallback(
    (bookId) => {
      const newCount = (retryCounts[bookId] || 0) + 1
      const newRetries = { ...retryCounts, [bookId]: newCount }

      setRetryCounts(newRetries)
      try {
        localStorage.setItem("retryCounts", JSON.stringify(newRetries))
      } catch (e) {
        console.error("LS Error:", e)
      }

      if (newCount >= 3) {
        const endTime = Date.now() + COOLDOWN_DURATION_MS
        const newCooldowns = { ...cooldownEndTimes, [bookId]: endTime }

        setCooldownEndTimes(newCooldowns)
        try {
          localStorage.setItem("cooldownEndTimes", JSON.stringify(newCooldowns))
        } catch (e) {
          console.error("LS Error:", e)
        }

        setTimeout(() => resetRetryCount(bookId), COOLDOWN_DURATION_MS)
      }
    },
    [retryCounts, cooldownEndTimes, resetRetryCount]
  )

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
