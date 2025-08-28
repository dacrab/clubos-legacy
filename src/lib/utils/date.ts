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