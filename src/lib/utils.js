import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { DURATION_MS } from "@/lib/constants"

export const cn = (...inputs) => {
  return twMerge(clsx(inputs))
}

export const fetcher = async (url) => {
  await new Promise((resolve) => setTimeout(resolve, DURATION_MS))
  const response = await fetch(url)
  return response.json()
}
