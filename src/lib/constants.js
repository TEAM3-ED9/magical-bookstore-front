export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const DURATION_MS = 1000;
export const UNLOCK_DURATION_MS = 60000;
export const COOLDOWN_DURATION_MS = 60000;
export const BOOKS_PER_SHELF = 8;

export const API_ENDPOINTS = {
  BOOKS: `${BACKEND_URL}/books`,
  TITLE_SEARCH: `${BACKEND_URL}/books/title`,
  AUTHOR_SEARCH: `${BACKEND_URL}/books/author`,
  GET_QUESTION: `${BACKEND_URL}/questions/random?book_id=`,
  VALIDATE_QUESTION: `${BACKEND_URL}/questions/validate-answer`,
  LOCK_BOOK: `${BACKEND_URL}/questions/lock`,
};

export const SWR_OPTIONS = {
  errorRetryInterval: 3000,
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    if (retryCount >= 5) return;
    setTimeout(() => revalidate({ retryCount }), 5000);
  },
};

export const SEARCH_SWR_OPTIONS = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  errorRetryCount: 3,
};
