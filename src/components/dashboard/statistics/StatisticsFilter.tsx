'use client';

import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { el } from 'date-fns/locale/el';
import { CalendarIcon, Filter, X } from 'lucide-react';

import { DATE_FORMAT, QUICK_SELECT_OPTIONS } from '@/lib/constants';
import { cn, formatDateToYYYYMMDD } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar, type DateRange } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DateRangeType {
  startDate: string;
  endDate: string;
}

interface StatisticsFilterProps {
  onFilterChange: (dateRange: DateRangeType) => void;
}

const getQuickSelectRange = (value: string): { from: Date; to: Date } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (value) {
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
      lastWeekStart.setDate(today.getDate() - today.getDay() - 6);
      const lastWeekEnd = new Date(today);
      lastWeekEnd.setDate(today.getDate() - today.getDay());
      return { from: lastWeekStart, to: lastWeekEnd };
    }
    case 'THIS_MONTH':
      return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: new Date() };
    case 'LAST_MONTH': {
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: lastMonthStart, to: lastMonthEnd };
    }
    default:
      return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: new Date() };
  }
};

export default function StatisticsFilter({ onFilterChange }: StatisticsFilterProps) {
  const [dateRange, setDateRange] = useState<DateRange>();
  const [quickSelect, setQuickSelect] = useState('THIS_MONTH');
  const [isOpen, setIsOpen] = useState(false);
  const updateFilter = useCallback(
    (from: Date, to: Date) => {
      setDateRange({ from, to });
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
      updateFilter(from, to);
    },
    [updateFilter]
  );

  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      return;
    }
    setQuickSelect('CUSTOM');
    updateFilter(range.from, range.to || range.from);
  };
  const handleClear = () => {
    setDateRange(undefined);
    setQuickSelect('THIS_MONTH');
    onFilterChange({ startDate: '', endDate: '' });
  };

  useEffect(() => {
    handleQuickSelect('THIS_MONTH');
  }, [handleQuickSelect]);
  return (
    <div className="bg-muted/50 rounded-lg border">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Filter className="text-muted-foreground h-4 w-4" />
          <span className="text-sm font-medium">Φίλτρα</span>
        </div>
        <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="h-9 px-3 text-sm">
          {isOpen ? 'Απόκρυψη' : 'Εμφάνιση'}
        </Button>
      </div>
      {isOpen && (
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm font-medium">Γρήγορη επιλογή</Label>
              <Select value={quickSelect} onValueChange={handleQuickSelect}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
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

            <div>
              <Label className="text-sm font-medium">Εύρος ημερομηνιών</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'mt-2 w-full justify-start text-left font-normal',
                      !dateRange?.from && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from
                      ? dateRange.to
                        ? `${format(dateRange.from, DATE_FORMAT.DISPLAY)} - ${format(dateRange.to, DATE_FORMAT.DISPLAY)}`
                        : format(dateRange.from, DATE_FORMAT.DISPLAY)
                      : 'Επιλέξτε ημερομηνίες'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={handleDateSelect}
                    numberOfMonths={2}
                    locale={el}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button variant="outline" onClick={handleClear} className="flex items-center gap-2">
            <X className="h-4 w-4" />
            Καθαρισμός
          </Button>
        </div>
      )}
    </div>
  );
}
