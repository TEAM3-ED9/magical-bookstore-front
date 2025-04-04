import { useState, useEffect } from "react"
import { DURATION_MS } from "@/lib/constants"

export const usePhraseCycle = (phrases, interval = DURATION_MS) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const cycle = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % phrases.length)
    }, interval / phrases.length)

    return () => clearInterval(cycle)
  }, [phrases, interval])

  return phrases[currentIndex]
}
