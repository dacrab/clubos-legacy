'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';
import type { DateRange } from 'react-day-picker';
import {
  addDays,
  addMonths,
  endOfMonth,
  formatDate,
  isSameDay,
  isSameMonth,
  setDay,
  startOfMonth,
  subMonths,
} from '@/lib/utils/date-utils';
import { cn } from '@/lib/utils/format';

// Types
type CalendarProps = {
  mode?: 'single' | 'range';
  selected?: Date | DateRange | undefined;
  onSelect?: ((date: DateRange | undefined) => void) | ((date: Date | undefined) => void);
  className?: string;
  defaultMonth?: Date;
  numberOfMonths?: number;
  locale?: unknown;
  initialFocus?: boolean;
};

// Constants
const MONDAY_YEAR = 2024;
const MONDAY_MONTH = 0;
const MONDAY_DAY = 1;
const MONDAY_DATE = new Date(MONDAY_YEAR, MONDAY_MONTH, MONDAY_DAY);
const DAYS_IN_WEEK = 7;
const DAY_OFFSET = 6;

// Helpers
const formatWithLocale = (date: Date, formatStr: string) => {
  switch (formatStr) {
    case 'EE':
      return new Intl.DateTimeFormat('el', { weekday: 'short' }).format(date);
    case 'LLLL yyyy':
      return new Intl.DateTimeFormat('el', {
        month: 'long',
        year: 'numeric',
      }).format(date);
    case 'd':
      return new Intl.DateTimeFormat('el', { day: 'numeric' }).format(date);
    default:
      return formatDate(date, { day: 'numeric', month: 'long', year: 'numeric' });
  }
};

export function Calendar({
  mode = 'single',
  selected,
  onSelect,
  className,
  defaultMonth,
}: CalendarProps) {
  // State
  const [currentMonth, setCurrentMonth] = React.useState(defaultMonth || new Date());
  const today = new Date();

  // Calendar calculations
  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);

  const daysInMonth: Date[] = [];
  const currentDate = new Date(firstDayOfMonth);
  while (currentDate <= lastDayOfMonth) {
    daysInMonth.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const monday = setDay(MONDAY_DATE, 1);
  const weekDays = Array.from({ length: DAYS_IN_WEEK }, (_, i: number) => {
    const date = addDays(monday, i);
    return formatWithLocale(date, 'EE');
  });

  const firstDayOfWeek = (firstDayOfMonth.getDay() + DAY_OFFSET) % DAYS_IN_WEEK;
  const emptyCells = new Array(firstDayOfWeek).fill(null);

  // Handlers
  const handlePreviousMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  const handleSelectDate = (selectedDate: Date) => {
    if (mode === 'single') {
      (onSelect as (date: Date | undefined) => void)(selectedDate);
      return;
    }

    const range = selected as DateRange | undefined;

    if (!range?.from) {
      (onSelect as (date: DateRange | undefined) => void)({
        from: selectedDate,
        to: undefined,
      });
    } else if (range.to) {
      (onSelect as (date: DateRange | undefined) => void)({
        from: selectedDate,
        to: undefined,
      });
    } else {
      (onSelect as (date: DateRange | undefined) => void)(
        selectedDate < range.from
          ? { from: selectedDate, to: range.from }
          : { from: range.from, to: selectedDate }
      );
    }
  };

  const isDateSelected = (date: Date) => {
    if (!selected) {
      return false;
    }

    if (mode === 'single') {
      return isSameDay(date, selected as Date);
    }

    const range = selected as DateRange;
    if (!range.from) {
      return false;
    }
    if (!range.to) {
      return isSameDay(date, range.from);
    }
    return date >= range.from && date <= range.to;
  };

  return (
    <div className={cn('space-y-4 rounded-lg bg-background p-3 shadow-xs', className)}>
      {/* Header */}
      <div className="relative flex items-center justify-center">
        <button
          className="absolute left-1 rounded-md p-1 hover:bg-accent"
          onClick={handlePreviousMonth}
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-medium text-sm">{formatWithLocale(currentMonth, 'LLLL yyyy')}</div>
        <button
          className="absolute right-1 rounded-md p-1 hover:bg-accent"
          onClick={handleNextMonth}
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map((day: string) => (
          <div
            className="flex h-8 items-center justify-center text-muted-foreground text-sm"
            key={day}
          >
            {day}
          </div>
        ))}

        {/* Empty cells */}
        {emptyCells.map((_, i: number) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: For empty cells, using an index is acceptable as the list is static.
          <div className="h-9" key={i} />
        ))}

        {/* Days */}
        {daysInMonth.map((day: Date) => {
          const isSelected = isDateSelected(day);
          const isToday = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, currentMonth);

          return (
            <button
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                isSelected &&
                  'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                !isSelected && isToday && 'border border-primary/50 text-foreground',
                !isCurrentMonth && 'text-muted-foreground opacity-50'
              )}
              key={day.toString()}
              onClick={() => handleSelectDate(day)}
              type="button"
            >
              {formatWithLocale(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
