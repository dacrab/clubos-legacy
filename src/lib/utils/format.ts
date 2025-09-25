import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Re-export date formatting from date.ts to maintain backward compatibility

// Price formatting constants
const CURRENCY_SYMBOL = '€' as const;
const DECIMAL_PLACES = 2 as const;

/**
 * Utility function for conditional class names
 * @param inputs Class values to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a price with currency symbol
 * @param price Price to format
 * @returns Formatted price string
 */
export function formatPrice(price: number): string {
  return `${price.toFixed(DECIMAL_PLACES)}${CURRENCY_SYMBOL}`;
}
