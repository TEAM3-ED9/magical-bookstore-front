/**
 * The base URL for the backend API, loaded from the environment variable `VITE_BACKEND_URL`.
 * @type {string}
 */
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

/**
 * The standard duration in milliseconds for various short-term UI elements or transitions.
 * @type {number}
 */
export const DURATION_MS = 1000

/**
 * The duration in milliseconds for which a book remains locked after a question attempt.
 * @type {number}
 */
export const UNLOCK_DURATION_MS = 60000

/**
 * The cooldown duration in milliseconds before a user can attempt another action (e.g., answering a question again).
 * @type {number}
 */
export const COOLDOWN_DURATION_MS = 60000

/**
 * The number of books displayed per bookshelf.
 * @type {number}
 */
export const BOOKS_PER_SHELF = 8

/**
 * The duration in milliseconds for which messages are displayed to the user.
 * @type {number}
 */
export const MESSAGE_DURATION_MS = 5000

/**
 * An object containing the API endpoint URLs.
 * @type {object}
 * @property {string} BOOKS - The endpoint for fetching all books.
 * @property {string} TITLE_SEARCH - The endpoint for searching books by title.
 * @property {string} AUTHOR_SEARCH - The endpoint for searching books by author.
 * @property {string} GET_QUESTION - The endpoint for fetching a random question for a specific book (append book ID).
 * @property {string} VALIDATE_QUESTION - The endpoint for validating a user's answer to a question.
 * @property {string} LOCK_BOOK - The endpoint for locking a book for a certain duration.
 */
/**
 * @constant {Object} API_ENDPOINTS
 * @description Contains the API endpoint URLs for various backend services.
 * @property {string} BOOKS - Endpoint for fetching books.
 * @property {string} TITLE_SEARCH - Endpoint for searching books by title.
 * @property {string} AUTHOR_SEARCH - Endpoint for searching books by author.
 * @property {string} GET_QUESTION - Endpoint for fetching a random question for a specific book.
 * @property {string} VALIDATE_QUESTION - Endpoint for validating an answer to a question.
 * @property {string} LOCK_BOOK - Endpoint for locking a book.
 * @property {string} SECRET_WORDS - Endpoint for fetching secret words.
 */
export const API_ENDPOINTS = {
  BOOKS: `${BACKEND_URL}/books`,
  TITLE_SEARCH: `${BACKEND_URL}/books/title`,
  AUTHOR_SEARCH: `${BACKEND_URL}/books/author`,
  GET_QUESTION: `${BACKEND_URL}/questions/random?book_id=`,
  VALIDATE_QUESTION: `${BACKEND_URL}/questions/validate-answer`,
  LOCK_BOOK: `${BACKEND_URL}/questions/lock`,
  SECRET_WORDS: `${BACKEND_URL}/secrets`
}

/**
 * Global options for the `swr` library, defining error retry behavior.
 * @type {object}
 * @property {number} errorRetryInterval - The interval in milliseconds before attempting to retry an error.
 * @property {function} onErrorRetry - A function that determines if and how an error should be retried.
 */
export const SWR_OPTIONS = {
  errorRetryInterval: 3000,
  onErrorRetry: (_error, _key, _config, revalidate, { retryCount }) => {
    if (retryCount >= 5) return
    setTimeout(() => revalidate({ retryCount }), 5000)
  }
}

/**
 * Specific `swr` options for search-related data fetching, preventing revalidation on focus and stale data.
 * @type {object}
 * @property {boolean} revalidateIfStale - Whether to revalidate data even if it's considered stale. Set to `false` for search.
 * @property {boolean} revalidateOnFocus - Whether to revalidate data when the window or tab gains focus. Set to `false` for search.
 * @property {number} errorRetryCount - The maximum number of times to retry fetching data on error for search.
 */
export const SEARCH_SWR_OPTIONS = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  errorRetryCount: 3
}
