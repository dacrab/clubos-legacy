import { type ClassValue, clsx } from "clsx"
 
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

interface DateInterval {
  start: Date
  end: Date
}

export function eachDayOfInterval({ start, end }: DateInterval): Date[] {
  const days: Date[] = []
  const currentDate = new Date(start)

  while (currentDate <= end) {
    days.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return days
} 

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: false,
  hourCycle: 'h23'
};

/**
 * Formats a date with Greek AM/PM indicators
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDateWithGreekAmPm(date: Date): string {
  return date
    .toLocaleString('el', DATE_FORMAT_OPTIONS)
    .replace('AM', 'π.μ.')
    .replace('PM', 'μ.μ.');
}

/**
 * Formats a date string with Greek AM/PM indicators
 * @param dateString Date string to format
 * @returns Formatted date string
 */
export function formatDateStringWithGreekAmPm(dateString: string): string {
  return formatDateWithGreekAmPm(new Date(dateString));
}

/**
 * Formats a date to YYYY-MM-DD format
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDateToYYYYMMDD(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Formats a time to HH:mm format
 * @param date Date to format
 * @returns Formatted time string
 */
export function formatTimeToHHMM(date: Date): string {
  return date.toLocaleTimeString('el', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/**
 * Formats a generic date string
 * @param dateString
 * @returns Formatted date string
 */
export function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('el-GR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formats a number as a price string in EUR.
 * @param price The number to format.
 * @returns A string representing the price in EUR.
 */
export function formatPrice(price: number) {
  return `${price.toFixed(2)}€`;
}
