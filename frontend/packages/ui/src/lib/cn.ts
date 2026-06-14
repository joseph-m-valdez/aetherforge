import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge conditional class names and let later Tailwind utilities win over
// earlier ones (so a caller's `className` can override a primitive's defaults).
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
