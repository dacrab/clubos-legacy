'use client';

import { format } from 'date-fns';
import { el } from 'date-fns/locale/el';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DATE_FORMAT } from '@/lib/constants';
import { cn } from '@/lib/utils/format';

type DateRangePickerProps = {
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
  className?: string;
};

function getDisplayText(range: DateRange | undefined): string {
  if (!range?.from) {
    return 'Επιλογή ημερομηνίας';
  }
  if (range.to) {
    return `${format(range.from, DATE_FORMAT.DISPLAY)} - ${format(range.to, DATE_FORMAT.DISPLAY)}`;
  }
  return format(range.from, DATE_FORMAT.DISPLAY);
}

export default function DateRangePicker({
  dateRange,
  setDateRange,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from && range.to) {
      setOpen(false);
    }
  };

  const displayText = getDisplayText(dateRange);

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              'w-[300px] justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground'
            )}
            id="date"
            variant="outline"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{displayText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            defaultMonth={dateRange?.from ?? new Date()}
            initialFocus
            locale={el}
            mode="range"
            numberOfMonths={2}
            onSelect={handleSelect}
            selected={dateRange}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
