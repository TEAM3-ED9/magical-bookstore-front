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
