import { DURATION_MS } from '@/lib/constants'
import { clsx } from 'clsx'
import useSWRMutation from 'swr/mutation'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class names into a single string, resolving Tailwind CSS class conflicts.
 * Uses `clsx` for conditional class names and `tailwind-merge` to ensure Tailwind classes are correctly merged.
 *
 * @param {...any} inputs - Multiple class name arguments (strings or objects as supported by `clsx`).
 * @returns {string} A string of merged class names.
 */
export const cn = (...inputs) => {
  return twMerge(clsx(inputs))
}

/**
 * Asynchronously makes an HTTP request with a simulated delay.
 * Includes default headers for JSON content and handles non-ok responses by throwing an error.
 *
 * @async
 * @param {string} url - The URL to make the request to.
 * @param {RequestInit} [options={}] - Optional fetch API options.
 * @returns {Promise<any>} A promise that resolves to the JSON response body.
 * @throws {Error} If the HTTP response status is not ok.
 */
export const request = async (url, options = {}) => {
  await new Promise((resolve) => setTimeout(resolve, DURATION_MS))
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

/**
 * Asynchronously fetches data from a given URL using the {@link request} function.
 * This is a simple fetcher function suitable for use with `swr`.
 *
 * @async
 * @param {string} url - The URL to fetch data from.
 * @returns {Promise<any>} A promise that resolves to the JSON response body.
 * @throws {Error} If the HTTP response status is not ok (thrown by {@link request}).
 */
export const fetcher = async (url) => {
  return request(url)
}

/**
 * Custom hook that utilizes `useSWRMutation` for performing mutations (e.g., POST, PUT, DELETE requests).
 * It uses the {@link request} function to handle the actual HTTP request.
 *
 * @param {string} url - The URL for the mutation.
 * @param {object} [options={}] - Optional options to pass to `useSWRMutation`.
 * @returns {object} The object returned by `useSWRMutation`.
 */
export const useCustomMutation = (url, options = {}) => {
  return useSWRMutation(
    url,
    /**
     * @param {string} key
     * @param {{ arg?: object }} params
     */
    async (key, { arg } = { arg: undefined }) => {
      return request(key, { ...options, ...(arg || {}) })
    }
  )
}

/**
 * Determines the appropriate width and height for a book display based on the window size.
 * Returns fixed dimensions for larger screens or responsive dimensions for smaller screens.
 *
 * @returns {{ width: string, height: string }} An object containing the width and height styles for the book.
 */
export const getBookSize = () => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth < 640) {
      return { width: '95vw', height: '80vh' }
    } else if (window.innerWidth < 768) {
      return { width: '90vw', height: '70vh' }
    }
  }
  return { width: '760px', height: '520px' }
}

/**
 * Clears multiple keys from the browser's local storage.
 *
 * @param {string[]} keys - An array of keys to remove from local storage.
 * @returns {void}
 */
export const clearLocalStorage = (keys) => {
  keys.forEach((key) => localStorage.removeItem(key))
}

/**
 * Formats a given number of milliseconds into a `MM:SS` time string.
 * Handles cases where the input is zero or negative by returning '00:00'.
 *
 * @param {number} milliseconds - The time in milliseconds to format.
 * @returns {string} The formatted time string in `MM:SS` format.
 */
export function formatTime(milliseconds) {
  if (milliseconds <= 0) {
    return '00:00'
  }
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
