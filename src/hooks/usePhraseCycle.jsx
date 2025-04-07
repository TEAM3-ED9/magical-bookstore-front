import { useState, useEffect } from "react"
import { DURATION_MS } from "@/lib/constants"

export const usePhraseCycle = (phrases, interval = DURATION_MS) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!isActive) return

    const timeout = setTimeout(() => {
      setIsActive(false)
    }, interval)

    return () => clearTimeout(timeout)
  }, [isActive, interval])

  useEffect(() => {
    if (!isActive) return

    const cycle = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % phrases.length)
    }, interval / phrases.length)

    return () => clearInterval(cycle)
  }, [phrases, interval, isActive])

  return phrases[currentIndex]
}
