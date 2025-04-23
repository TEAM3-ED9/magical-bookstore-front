import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { DURATION_MS } from "@/lib/constants"
import useSWRMutation from "swr/mutation"

export const cn = (...inputs) => {
  return twMerge(clsx(inputs))
}

export const request = async (url, options = {}) => {
  await new Promise((resolve) => setTimeout(resolve, DURATION_MS))
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }
  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export const fetcher = async (url) => {
  return request(url)
}

export const useCustomMutation = (url, options = {}) => {
  return useSWRMutation(url, async (key, { arg }) => {
    return request(key, { ...options, ...arg })
  })
}

export const getBookSize = () => {
  if (typeof window !== "undefined") {
    if (window.innerWidth < 640) {
      return { width: "95vw", height: "80vh" }
    } else if (window.innerWidth < 768) {
      return { width: "90vw", height: "70vh" }
    }
  }
  return { width: "760px", height: "520px" }
}

export const clearLocalStorage = (keys) => {
  keys.forEach((key) => localStorage.removeItem(key))
}

export function formatTime(milliseconds) {
  if (milliseconds <= 0) {
    return "00:00"
  }
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`
}
