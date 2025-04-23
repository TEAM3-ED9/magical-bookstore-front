export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
export const DURATION_MS = 1000

export const BOOKS_PER_SHELF = 8

export const API_ENDPOINTS = {
  BOOKS: `${BACKEND_URL}/api/books`,
  TITLE_SEARCH: `${BACKEND_URL}/api/books/title`,
  AUTHOR_SEARCH: `${BACKEND_URL}/api/books/author`,
  GET_QUESTION: `${BACKEND_URL}/api/questions/random?book_id=`,
  VALIDATE_QUESTION: `${BACKEND_URL}/api/questions/validate-answer`,
}

export const SWR_OPTIONS = {
  errorRetryInterval: 3000,
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    if (retryCount >= 5) return
    setTimeout(() => revalidate({ retryCount }), 5000)
  },
}

export const SEARCH_SWR_OPTIONS = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  errorRetryCount: 3,
}
