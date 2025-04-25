import { useEffect, useState } from 'react'

/**
 * Custom hook that debounces a value, updating only after a specified delay without changes.
 *
 * @param {*} value - The value to debounce. Can be of any type.
 * @param {number} delay - The delay in milliseconds before the debounced value is updated.
 * @returns {*} The debounced value. Will be of the same type as the input `value`.
 */
export const useDebounce = (value, delay) => {
  /**
   * The debounced state value.
   * @type {*}
   */
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    /**
     * Sets the debounced value to the latest `value` after the specified `delay`.
     */
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    /**
     * Cleanup function to clear the timeout if the `value` or `delay` changes before the timeout completes.
     * @returns {void}
     */
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
