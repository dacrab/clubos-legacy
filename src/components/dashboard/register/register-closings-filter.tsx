'use client';

import { format } from 'date-fns';
import { el } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
import type { DateRange as DayRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DateRange } from '@/types/register';

type RegisterClosingsFilterProps = {
  onFilterChange: (dateRange: DateRange) => void;
};

const QUICK_SELECT_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  THIS_WEEK: 'thisWeek',
  LAST_WEEK: 'lastWeek',
  THIS_MONTH: 'thisMonth',
  LAST_MONTH: 'lastMonth',
  THIS_YEAR: 'thisYear',
  LAST_YEAR: 'lastYear',
};

const DATE_FORMAT = {
  API: 'yyyy-MM-dd',
  DISPLAY: 'dd/MM/yyyy',
};

const DAY_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
};

const CALENDAR = {
  MONTHS_IN_YEAR: 11,
  DAYS_IN_MONTH: 31,
  DAYS_IN_WEEK: 7,
  MOBILE_BREAKPOINT: 768,
};

const getStartOfWeek = (date: Date, startOfWeek: number) => {
  const day = date.getDay();
  const diff = day - startOfWeek;
  return new Date(date.setDate(date.getDate() - diff));
};

const getQuickSelectDateRange = (range: string) => {
  const today = new Date();
  switch (range) {
    case QUICK_SELECT_RANGES.TODAY:
      return { start: today, end: today };
    case QUICK_SELECT_RANGES.YESTERDAY: {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      return { start: yesterday, end: yesterday };
    }
    case QUICK_SELECT_RANGES.THIS_WEEK: {
      const startOfWeek = getStartOfWeek(today, DAY_OF_WEEK.MONDAY);
      return { start: startOfWeek, end: new Date() };
    }
    case QUICK_SELECT_RANGES.LAST_WEEK: {
      const startOfLastWeek = getStartOfWeek(
        new Date(today.setDate(today.getDate() - CALENDAR.DAYS_IN_WEEK)),
        DAY_OF_WEEK.MONDAY
      );
      const endOfLastWeek = new Date(startOfLastWeek);
      endOfLastWeek.setDate(startOfLastWeek.getDate() + CALENDAR.DAYS_IN_WEEK - 1);
      return { start: startOfLastWeek, end: endOfLastWeek };
    }
    case QUICK_SELECT_RANGES.THIS_MONTH:
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: today,
      };
    case QUICK_SELECT_RANGES.LAST_MONTH: {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return {
        start: lastMonth,
        end: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0),
      };
    }
    case QUICK_SELECT_RANGES.THIS_YEAR:
      return {
        start: new Date(today.getFullYear(), 0, 1),
        end: today,
      };
    case QUICK_SELECT_RANGES.LAST_YEAR: {
      const lastYear = today.getFullYear() - 1;
      return {
        start: new Date(lastYear, 0, 1),
        end: new Date(lastYear, CALENDAR.MONTHS_IN_YEAR, CALENDAR.DAYS_IN_MONTH),
      };
    }
    default:
      return { start: null, end: null };
  }
};

function FilterContent({ onFilterChange }: { onFilterChange: (dateRange: DateRange) => void }) {
  const [date, setDate] = useState<DayRange | undefined>(undefined);
  const [quickSelect, setQuickSelect] = useState<string>('');

  useEffect(() => {
    if (quickSelect) {
      const { start, end } = getQuickSelectDateRange(quickSelect);
      if (start && end) {
        setDate({ from: start, to: end });
        onFilterChange({
          startDate: format(start, DATE_FORMAT.API),
          endDate: format(end, DATE_FORMAT.API),
        });
      }
    }
  }, [quickSelect, onFilterChange]);

  const handleDateChange = (range: DayRange | undefined) => {
    setDate(range);
    if (range?.from && range.to) {
      onFilterChange({
        startDate: format(range.from, DATE_FORMAT.API),
        endDate: format(range.to, DATE_FORMAT.API),
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex lg:flex-wrap">
      <div className="w-full sm:col-span-1 lg:w-40">
        <Select onValueChange={setQuickSelect} value={quickSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Γρήγορη Επιλογή" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(QUICK_SELECT_RANGES).map(([key, value]) => (
              <SelectItem key={key} value={value}>
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:col-span-2 lg:w-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              className="w-full justify-start text-left font-normal"
              id="date"
              variant="outline"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(date.from, 'LLL dd, y')
                )
              ) : (
                <span>Επιλέξτε ημερομηνίες</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              defaultMonth={date?.from ?? new Date()}
              initialFocus
              locale={el}
              mode="range"
              numberOfMonths={window.innerWidth < CALENDAR.MOBILE_BREAKPOINT ? 1 : 2}
              onSelect={handleDateChange}
              selected={date}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

const MemoizedFilterContent = memo(FilterContent);

function RegisterClosingsFilter({ onFilterChange }: RegisterClosingsFilterProps) {
  return <MemoizedFilterContent onFilterChange={onFilterChange} />;
}

export default memo(RegisterClosingsFilter);
