import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to copy the access key to clipboard
export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  toast.success("Copied!")
}

// Function to format the price in BDT currency
export const formatMony = (price: number = 0) => `BDT ${price.toLocaleString()}`

export const handleAxiosError = (error: any) => {
  // Axios error structure
  if (error.response) {
    // Backend returns a response with status code (4xx, 5xx)
    toast.error(
      error.response.data.error.message || "An error occurred on the server."
    )

    return {
      message:
        error.response.data.error.message || "An error occurred on the server.",
      status: error.response.status,
    }
  } else if (error.request) {
    // Request was made but no response was received
    toast.error("No response from the server. Please check your connection.")
    return {
      message: "No response from the server. Please check your connection.",
      status: null,
    }
  } else {
    // Something happened while setting up the request
    toast.error("An error occurred while setting up the request.")
    return {
      message: "An error occurred while setting up the request.",
      status: null,
    }
  }
}