import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to copy the access key to clipboard
export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Copied!");
};

// Function to format the price in BDT currency
export const formatMony = (price: number = 0) =>
  `BDT ${price.toLocaleString()}`;