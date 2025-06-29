/**
 * Formats a number as a price string in EUR.
 * @param price The number to format.
 * @returns A string representing the price in EUR.
 */
export function formatPrice(price: number) {
  return `${price.toFixed(2)}€`;
} 