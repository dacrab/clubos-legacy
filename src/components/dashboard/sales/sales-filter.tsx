'use client';

import { CalendarIcon, Filter, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QUICK_SELECT_OPTIONS } from '@/lib/constants';
import { formatDate, formatDateToYYYYMMDD, greekLocale } from '@/lib/utils/date-utils';
import { cn } from '@/lib/utils/format';

type SalesDateRange = {
  startDate: string;
  endDate: string;
};

type TimeRange = {
  startTime: string;
  endTime: string;
};

type SalesFilterProps = {
  onFilterChange: (dateRange: SalesDateRange, timeRange: TimeRange) => void;
};

// Constants
const TIME_VALIDATION_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const MAX_TIME_INPUT_LENGTH = 5;
const MOBILE_BREAKPOINT = 768;

const DATE_CONSTANTS = {
  END_OF_DAY: { HOURS: 23, MINUTES: 59, SECONDS: 59, MS: 999 },
  WEEK_START_SUNDAY_OFFSET: -6,
  WEEK_START_NORMAL_OFFSET: 1,
  LAST_WEEK_START_OFFSET: 6,
  LAST_WEEK_END_OFFSET: 6,
  LAST_YEAR_END_MONTH: 11,
  LAST_YEAR_END_DAY: 31,
} as const;

const getDateRangeForQuickSelect = (value: string): { start: Date; end: Date } | null => {
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));

  const ranges = {
    TODAY: {
      start: today,
      end: new Date(),
    },
    YESTERDAY: {
      start: new Date(today.setDate(today.getDate() - 1)),
      end: new Date(
        today.setHours(
          DATE_CONSTANTS.END_OF_DAY.HOURS,
          DATE_CONSTANTS.END_OF_DAY.MINUTES,
          DATE_CONSTANTS.END_OF_DAY.SECONDS,
          DATE_CONSTANTS.END_OF_DAY.MS
        )
      ),
    },
    THIS_WEEK: {
      start: new Date(
        today.setDate(
          today.getDate() -
            today.getDay() +
            (today.getDay() === 0
              ? DATE_CONSTANTS.WEEK_START_SUNDAY_OFFSET
              : DATE_CONSTANTS.WEEK_START_NORMAL_OFFSET)
        )
      ),
      end: new Date(),
    },
    LAST_WEEK: {
      start: new Date(
        today.setDate(today.getDate() - today.getDay() - DATE_CONSTANTS.LAST_WEEK_START_OFFSET)
      ),
      end: new Date(new Date(today).setDate(today.getDate() + DATE_CONSTANTS.LAST_WEEK_END_OFFSET)),
    },
    THIS_MONTH: {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: new Date(),
    },
    LAST_MONTH: {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    },
    THIS_YEAR: {
      start: new Date(today.getFullYear(), 0, 1),
      end: new Date(),
    },
    LAST_YEAR: {
      start: new Date(today.getFullYear() - 1, 0, 1),
      end: new Date(
        today.getFullYear() - 1,
        DATE_CONSTANTS.LAST_YEAR_END_MONTH,
        DATE_CONSTANTS.LAST_YEAR_END_DAY
      ),
    },
  };

  return ranges[value as keyof typeof ranges];
};

const isValidTimeFormat = (time: string) => {
  if (!time) {
    return true;
  }
  return TIME_VALIDATION_REGEX.test(time);
};

type FilterContentProps = {
  date: DateRange | undefined;
  timeRange: TimeRange;
  quickSelect: string;
  calendarOpen: boolean;
  handleQuickSelectChange: (value: string) => void;
  setCalendarOpen: (open: boolean) => void;
  handleDateChange: (range: DateRange | undefined) => void;
  handleTimeChange: (field: keyof TimeRange, value: string) => void;
  handleClearFilter: () => void;
};

function FilterContent({
  date,
  timeRange,
  quickSelect,
  calendarOpen,
  handleQuickSelectChange,
  setCalendarOpen,
  handleDateChange,
  handleTimeChange,
  handleClearFilter,
}: FilterContentProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:flex lg:flex-wrap">
      <div className="w-full sm:col-span-1 lg:w-40">
        <Label className="font-medium text-sm sm:text-base">Γρήγορη επιλογή</Label>
        <Select onValueChange={handleQuickSelectChange} value={quickSelect}>
          <SelectTrigger className="mt-2 h-11 text-sm sm:h-12 sm:text-base">
            <SelectValue placeholder="Επιλέξτε περίοδο" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(QUICK_SELECT_OPTIONS).map(([key, label]) => (
              <SelectItem className="py-2 text-sm sm:text-base" key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:col-span-1 lg:w-52 xl:w-60">
        <Label className="font-medium text-sm sm:text-base">Εύρος ημερομηνιών</Label>
        <Popover onOpenChange={setCalendarOpen} open={calendarOpen}>
          <PopoverTrigger asChild>
            <Button
              className={cn(
                'mt-2 h-11 w-full justify-start text-left font-normal text-sm sm:h-12 sm:text-base',
                !date?.from && 'text-muted-foreground'
              )}
              variant="outline"
            >
              <CalendarIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              {date?.from ? (
                date.to ? (
                  <>
                    {formatDate(date.from, { day: '2-digit', month: '2-digit', year: 'numeric' })} -{' '}
                    {formatDate(date.to, { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </>
                ) : (
                  formatDate(date.from, { day: '2-digit', month: '2-digit', year: 'numeric' })
                )
              ) : (
                'Επιλέξτε ημερομηνίες'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              className="scale-100 p-3 sm:p-4"
              defaultMonth={date?.from || new Date()}
              initialFocus
              locale={greekLocale}
              mode="range"
              numberOfMonths={window.innerWidth < MOBILE_BREAKPOINT ? 1 : 2}
              onSelect={handleDateChange}
              selected={date}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex w-full gap-4 sm:col-span-2 lg:w-auto lg:flex-none">
        <div className="flex-1 lg:w-24">
          <Label className="font-medium text-sm sm:text-base">Από ώρα</Label>
          <Input
            className={cn(
              'mt-2 h-11 text-sm sm:h-12 sm:text-base',
              timeRange.startTime && !isValidTimeFormat(timeRange.startTime) && 'border-red-500'
            )}
            onChange={(e) => handleTimeChange('startTime', e.target.value)}
            placeholder="HH:mm"
            type="text"
            value={timeRange.startTime}
          />
        </div>

        <div className="flex-1 lg:w-24">
          <Label className="font-medium text-sm sm:text-base">Έως ώρα</Label>
          <Input
            className={cn(
              'mt-2 h-11 text-sm sm:h-12 sm:text-base',
              timeRange.endTime && !isValidTimeFormat(timeRange.endTime) && 'border-red-500'
            )}
            onChange={(e) => handleTimeChange('endTime', e.target.value)}
            placeholder="HH:mm"
            type="text"
            value={timeRange.endTime}
          />
        </div>
      </div>

      <div className="mt-2 flex items-end sm:col-span-2 lg:col-span-1">
        <Button
          className="flex h-11 items-center gap-2 px-4 text-sm sm:h-12 sm:text-base"
          onClick={handleClearFilter}
          variant="outline"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
          Καθαρισμός
        </Button>
      </div>
    </div>
  );
}

export default function SalesFilter({ onFilterChange }: SalesFilterProps) {
  const [date, setDate] = useState<DateRange>();
  const [timeRangeState, setTimeRange] = useState<TimeRange>({
    startTime: '',
    endTime: '',
  });
  const [quickSelect, setQuickSelect] = useState('CUSTOM');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const updateFilters = useCallback(
    (newDateRange: SalesDateRange, newTimeRange: TimeRange) => {
      onFilterChange(newDateRange, newTimeRange);
    },
    [onFilterChange]
  );

  const handleQuickSelectChange = useCallback(
    (value: string) => {
      const range = getDateRangeForQuickSelect(value);
      if (!range) {
        return;
      }

      const { start, end } = range;
      const newTimeRange = {
        startTime: '00:00',
        endTime:
          value === 'TODAY'
            ? formatDate(new Date(), { hour: '2-digit', minute: '2-digit', hour12: false })
            : '23:59',
      };

      setDate({ from: start, to: end });
      setTimeRange(newTimeRange);
      setQuickSelect(value);
      setCalendarOpen(false);

      updateFilters(
        {
          startDate: formatDateToYYYYMMDD(start),
          endDate: formatDateToYYYYMMDD(end),
        },
        newTimeRange
      );
    },
    [updateFilters]
  );

  useEffect(() => {
    if (!date) {
      handleQuickSelectChange('THIS_MONTH');
    }
  }, [date, handleQuickSelectChange]);

  const handleDateChange = (range: DateRange | undefined) => {
    if (!range?.from) {
      return;
    }

    setDate(range);
    setQuickSelect('CUSTOM');

    updateFilters(
      {
        startDate: formatDateToYYYYMMDD(range.from),
        endDate: formatDateToYYYYMMDD(range.to || range.from),
      },
      timeRangeState
    );
  };

  const handleTimeChange = (field: keyof TimeRange, value: string) => {
    if (value.length > MAX_TIME_INPUT_LENGTH) {
      return;
    }

    const newTimeRange = { ...timeRangeState, [field]: value };
    setTimeRange(newTimeRange);
    setQuickSelect('CUSTOM');

    if (isValidTimeFormat(value)) {
      updateFilters(
        {
          startDate: date?.from ? formatDateToYYYYMMDD(date.from) : '',
          endDate: getEndDate(),
        },
        {
          startTime: newTimeRange.startTime || '00:00',
          endTime: newTimeRange.endTime || '23:59',
        }
      );
    }
  };

  const handleClearFilter = () => {
    setDate(undefined);
    setTimeRange({ startTime: '', endTime: '' });
    setQuickSelect('CUSTOM');
    setCalendarOpen(false);
    updateFilters({ startDate: '', endDate: '' }, { startTime: '', endTime: '' });
  };

  const getEndDate = () => {
    if (date?.to) {
      return formatDateToYYYYMMDD(date.to);
    }
    if (date?.from) {
      return formatDateToYYYYMMDD(date.from);
    }
    return '';
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-muted/50">
      <div className="flex items-center justify-between border-b px-4 py-3 sm:px-5 sm:py-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Filter className="h-4 w-4 text-muted-foreground sm:h-5 sm:w-5" />
          <span className="font-medium text-sm sm:text-base">Φίλτρα</span>
        </div>
        <Button
          className="h-9 min-w-[100px] px-3 text-sm sm:h-10 sm:px-4 sm:text-base"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          variant="ghost"
        >
          {isFilterOpen ? 'Απόκρυψη' : 'Εμφάνιση'}
        </Button>
      </div>
      {isFilterOpen && (
        <div className="p-4 sm:p-5">
          <FilterContent
            calendarOpen={calendarOpen}
            date={date}
            handleClearFilter={handleClearFilter}
            handleDateChange={handleDateChange}
            handleQuickSelectChange={handleQuickSelectChange}
            handleTimeChange={handleTimeChange}
            quickSelect={quickSelect}
            setCalendarOpen={setCalendarOpen}
            timeRange={timeRangeState}
          />
        </div>
      )}
    </div>
  );
}
