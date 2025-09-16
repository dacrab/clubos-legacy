// Date formatting constants
const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: false,
  hourCycle: 'h23',
};

const GREEK_LOCALE = 'el' as const;
const GREEK_AM_PM = {
  AM: 'π.μ.',
  PM: 'μ.μ.',
} as const;

/**
 * Formats a date with Greek AM/PM indicators
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDateWithGreekAmPm(date: Date): string {
  return date
    .toLocaleString(GREEK_LOCALE, DATE_FORMAT_OPTIONS)
    .replace('AM', GREEK_AM_PM.AM)
    .replace('PM', GREEK_AM_PM.PM);
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
  return date.toISOString().slice(0, 10);
}

/**
 * Formats a time to HH:mm format
 * @param date Date to format
 * @returns Formatted time string
 */
export function formatTimeToHHMM(date: Date): string {
  return date.toLocaleTimeString(GREEK_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Formats a date for display in Greek locale
 * @param dateString Date string to format
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('el-GR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
