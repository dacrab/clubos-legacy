// Simple date utilities for Greek locale (24-hour format)

const GREEK_LOCALE = 'el-GR';

function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  return toDate(date).toLocaleString(GREEK_LOCALE, {
    hourCycle: 'h23',
    hour12: false,
    ...options,
  });
}

export function formatDateToYYYYMMDD(date: Date | string): string {
  return toDate(date).toISOString().slice(0, 10);
}

export function addDays(date: Date | string, days: number): Date {
  const d = toDate(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function addMonths(date: Date | string, months: number): Date {
  const d = toDate(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function subMonths(date: Date | string, months: number): Date {
  return addMonths(date, -months);
}

export function isWithinInterval(
  date: Date | string,
  range: { start: Date | string; end: Date | string }
): boolean {
  const d = toDate(date).getTime();
  const start = toDate(range.start).getTime();
  const end = toDate(range.end).getTime();
  return d >= start && d <= end;
}

export function startOfMonth(date: Date | string): Date {
  const d = toDate(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

const END_OF_DAY_HOUR = 23;
const END_OF_DAY_MINUTE = 59;
const END_OF_DAY_SECOND = 59;
const END_OF_DAY_MILLISECOND = 999;

export function endOfMonth(date: Date | string): Date {
  const d = toDate(date);
  return new Date(
    d.getFullYear(),
    d.getMonth() + 1,
    0,
    END_OF_DAY_HOUR,
    END_OF_DAY_MINUTE,
    END_OF_DAY_SECOND,
    END_OF_DAY_MILLISECOND
  );
}

export function parseISO(dateString: string): Date {
  return new Date(dateString);
}

const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DAYS_PER_WEEK = 7;

export function formatDistanceToNow(date: Date | string): string {
  const d = toDate(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();

  const min = SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;
  const hour = MINUTES_PER_HOUR * min;
  const day = HOURS_PER_DAY * hour;
  const week = DAYS_PER_WEEK * day;

  if (diffMs < min) {
    return 'μόλις τώρα';
  }
  if (diffMs < hour) {
    return `πριν από ${Math.floor(diffMs / min)} λεπτά`;
  }
  if (diffMs < day) {
    return `πριν από ${Math.floor(diffMs / hour)} ώρες`;
  }
  if (diffMs < week) {
    return `πριν από ${Math.floor(diffMs / day)} ημέρες`;
  }

  return formatDate(d, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  const d1 = toDate(a);
  const d2 = toDate(b);
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function isSameMonth(a: Date | string, b: Date | string): boolean {
  const d1 = toDate(a);
  const d2 = toDate(b);
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

export function setDay(date: Date | string, day: number): Date {
  const d = toDate(date);
  d.setDate(d.getDate() + (day - d.getDay()));
  return d;
}

// For React Day Picker
export const greekLocale = {
  code: 'el',
  localize: {
    month: (m: number) =>
      [
        'Ιανουάριος',
        'Φεβρουάριος',
        'Μάρτιος',
        'Απρίλιος',
        'Μάιος',
        'Ιούνιος',
        'Ιούλιος',
        'Αύγουστος',
        'Σεπτέμβριος',
        'Οκτώβριος',
        'Νοέμβριος',
        'Δεκέμβριος',
      ][m - 1],
    day: (d: number) => d.toString(),
  },
  options: {
    weekStartsOn: 1,
    firstWeekContainsDate: 4,
  },
};
