'use client';

import { format } from 'date-fns';
import { el } from 'date-fns/locale/el';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DATE_FORMAT, QUICK_SELECT_OPTIONS } from '@/lib/constants';
import { formatDateToYYYYMMDD } from '@/lib/utils/date';
import { cn } from '@/lib/utils/format';

type DateRangeType = {
  startDate: string;
  endDate: string;
};

type StatisticsFilterProps = {
  onFilterChange: (dateRange: DateRangeType) => void;
};

const LAST_DAY_OF_DECEMBER = 31;
const LAST_MONTH_OF_YEAR = 11;
const PREVIOUS_WEEK_START_DAY_OFFSET = 6;

const getQuickSelectRange = (option: string): { from: Date; to: Date } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (option) {
    case 'TODAY':
      return { from: today, to: new Date() };
    case 'YESTERDAY': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { from: yesterday, to: yesterday };
    }
    case 'THIS_WEEK': {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1);
      return { from: weekStart, to: new Date() };
    }
    case 'LAST_WEEK': {
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - today.getDay() - PREVIOUS_WEEK_START_DAY_OFFSET);
      const lastWeekEnd = new Date(today);
      lastWeekEnd.setDate(today.getDate() - today.getDay());
      return { from: lastWeekStart, to: lastWeekEnd };
    }
    case 'THIS_MONTH':
      return {
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: new Date(),
      };
    case 'LAST_MONTH': {
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: lastMonthStart, to: lastMonthEnd };
    }
    case 'THIS_YEAR': {
      return { from: new Date(today.getFullYear(), 0, 1), to: new Date() };
    }
    case 'LAST_YEAR': {
      const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
      const lastYearEnd = new Date(
        today.getFullYear() - 1,
        LAST_MONTH_OF_YEAR,
        LAST_DAY_OF_DECEMBER
      );
      return { from: lastYearStart, to: lastYearEnd };
    }
    default:
      return {
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: new Date(),
      };
  }
};

export default function StatisticsFilter({ onFilterChange }: StatisticsFilterProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>();
  const [quickSelect, setQuickSelect] = useState('THIS_MONTH');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const applyFilter = useCallback(
    (from: Date, to: Date) => {
      setSelectedRange({ from, to });
      onFilterChange({
        startDate: formatDateToYYYYMMDD(from),
        endDate: formatDateToYYYYMMDD(to),
      });
    },
    [onFilterChange]
  );

  const handleQuickSelect = useCallback(
    (value: string) => {
      setQuickSelect(value);
      const { from, to } = getQuickSelectRange(value);
      applyFilter(from, to);
      setIsCalendarOpen(false);
    },
    [applyFilter]
  );

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      return;
    }

    setSelectedRange(range);
    setQuickSelect('CUSTOM');
    applyFilter(range.from, range.to || range.from);
  };

  const clearFilters = () => {
    setSelectedRange(undefined);
    setQuickSelect('CUSTOM');
    setIsCalendarOpen(false);
    onFilterChange({ startDate: '', endDate: '' });
  };

  useEffect(() => {
    if (!selectedRange) {
      handleQuickSelect('THIS_MONTH');
    }
  }, [selectedRange, handleQuickSelect]);

  const getDateRangeDisplay = () => {
    if (!selectedRange?.from) {
      return 'Επιλέξτε ημερομηνίες';
    }
    if (selectedRange.to) {
      return `${format(selectedRange.from, DATE_FORMAT.DISPLAY)} - ${format(
        selectedRange.to,
        DATE_FORMAT.DISPLAY
      )}`;
    }
    return format(selectedRange.from, DATE_FORMAT.DISPLAY);
  };

  return (
    <div className="rounded-lg border bg-muted/50">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">Φίλτρα</span>
        </div>
        <Button onClick={() => setIsExpanded(!isExpanded)} size="sm" variant="ghost">
          {isExpanded ? 'Απόκρυψη' : 'Εμφάνιση'}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="font-medium text-sm">Γρήγορη επιλογή</Label>
              <Select onValueChange={handleQuickSelect} value={quickSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε περίοδο" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(QUICK_SELECT_OPTIONS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-medium text-sm">Εύρος ημερομηνιών</Label>
              <Popover onOpenChange={setIsCalendarOpen} open={isCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedRange?.from && 'text-muted-foreground'
                    )}
                    variant="outline"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {getDateRangeDisplay()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    defaultMonth={selectedRange?.from ?? new Date()}
                    initialFocus
                    locale={el}
                    mode="range"
                    numberOfMonths={2}
                    onSelect={handleDateRangeSelect}
                    selected={selectedRange}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={clearFilters} size="sm" variant="outline">
              <X className="mr-2 h-4 w-4" />
              Καθαρισμός
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
