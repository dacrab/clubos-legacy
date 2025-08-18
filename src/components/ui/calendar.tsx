'use client';

import * as React from 'react';
import { el } from 'date-fns/locale/el';
import { DayPicker, type DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';

// Re-export DateRange for other components
export type { DateRange };

// Base props shared between all modes
interface CalendarBaseProps {
  className?: string;
  defaultMonth?: Date;
  numberOfMonths?: number;
  locale?: typeof el;
  initialFocus?: boolean;
}

// Single mode props
interface CalendarSingleProps extends CalendarBaseProps {
  mode?: 'single';
  selected?: Date | undefined;
  onSelect?: (date: Date | undefined) => void;
}

// Range mode props
interface CalendarRangeProps extends CalendarBaseProps {
  mode: 'range';
  selected?: DateRange | undefined;
  onSelect?: (date: DateRange | undefined) => void;
}

// Union type for all calendar props
type CalendarProps = CalendarSingleProps | CalendarRangeProps;

export function Calendar({
  className,
  mode = 'single',
  selected,
  onSelect,
  numberOfMonths = 1,
  locale = el,
  defaultMonth,
  initialFocus,
  ...props
}: CalendarProps) {
  const classNames = {
    months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
    month: 'space-y-4',
    caption: 'flex justify-center pt-1 relative items-center',
    caption_label: 'text-sm font-medium',
    nav: 'space-x-1 flex items-center',
    nav_button: cn('h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'),
    nav_button_previous: 'absolute left-1',
    nav_button_next: 'absolute right-1',
    table: 'w-full border-collapse space-y-1',
    head_row: 'flex',
    head_cell: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] flex-1 text-center',
    row: 'flex w-full mt-2',
    cell: 'relative p-0 text-center text-sm focus-within:relative focus-within:z-20',
    day: cn(
      'h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none rounded-md'
    ),
    day_selected:
      'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
    day_today: 'bg-accent text-accent-foreground',
    day_outside: 'text-muted-foreground opacity-50',
    day_disabled: 'text-muted-foreground opacity-50',
    day_hidden: 'invisible',
  };

  if (mode === 'range') {
    return (
      <DayPicker
        mode="range"
        selected={selected as DateRange | undefined}
        onSelect={onSelect as (date: DateRange | undefined) => void}
        numberOfMonths={numberOfMonths}
        locale={locale}
        defaultMonth={defaultMonth}
        initialFocus={initialFocus}
        className={cn('p-3', className)}
        classNames={classNames}
        {...props}
      />
    );
  }

  return (
    <DayPicker
      mode="single"
      selected={selected as Date | undefined}
      onSelect={onSelect as (date: Date | undefined) => void}
      numberOfMonths={numberOfMonths}
      locale={locale}
      defaultMonth={defaultMonth}
      initialFocus={initialFocus}
      className={cn('p-3', className)}
      classNames={classNames}
      {...props}
    />
  );
}
