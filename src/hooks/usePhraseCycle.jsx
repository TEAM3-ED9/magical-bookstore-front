import { DURATION_MS } from '@/lib/constants'
import { useEffect, useState } from 'react'

/**
 * Custom hook that cycles through an array of phrases at a specified interval.
 * It displays each phrase for a fraction of the total interval.
 *
 * @param {Array<string>} phrases - An array of strings to cycle through.
 * @param {number} [interval=DURATION_MS] - The total duration in milliseconds for one full cycle of all phrases.
 * @returns {string} The currently displayed phrase from the `phrases` array.
 */
export const usePhraseCycle = (phrases, interval = DURATION_MS) => {
  /**
   * The index of the currently displayed phrase in the `phrases` array.
   * @type {ReturnType<typeof useState<number>>}
   */
  const [currentIndex, setCurrentIndex] = useState(0)

  /**
   * A boolean state to control whether the initial timeout to deactivate the cycle is active.
   * @type {ReturnType<typeof useState<boolean>>}
   */
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (!isActive) return

    /**
     * Sets `isActive` to false after the initial `interval`, effectively stopping the first phase.
     */
    const timeout = setTimeout(() => {
      setIsActive(false)
    }, interval)

    /**
     * Clears the timeout if the component unmounts or `isActive` or `interval` changes.
     * @returns {void}
     */
    return () => clearTimeout(timeout)
  }, [isActive, interval])

  useEffect(() => {
    if (!isActive) return

    /**
     * Sets up an interval to cycle through the `phrases` array.
     * Each phrase is displayed for `interval / phrases.length` milliseconds.
     */
    const cycle = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % phrases.length)
    }, interval / phrases.length)

    /**
     * Clears the interval if the component unmounts or `phrases`, `interval`, or `isActive` changes.
     * @returns {void}
     */
    return () => clearInterval(cycle)
  }, [phrases, interval, isActive])

  return phrases[currentIndex]
}
