"use client";

import { format } from "date-fns";
import { el } from 'date-fns/locale/el';
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DATE_FORMAT } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  onFilterChange: (dateRange: { startDate: string; endDate: string }) => void;
}

export default function DateRangePicker({ onFilterChange }: DateRangePickerProps) {
  const [dateRange, setDateRange] = useState<DateRange>();

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range);

    if (range?.from) {
      const endDate = range.to || range.from;
      onFilterChange({
        startDate: format(range.from, DATE_FORMAT.API),
        endDate: format(endDate, DATE_FORMAT.API)
      });
    }
  };

  const displayText = dateRange?.from 
    ? dateRange.to
      ? `${format(dateRange.from, DATE_FORMAT.DISPLAY)} - ${format(dateRange.to, DATE_FORMAT.DISPLAY)}`
      : format(dateRange.from, DATE_FORMAT.DISPLAY)
    : "Επιλέξτε ημερομηνίες";

  return (
    <div className="w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !dateRange?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayText}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from || new Date()}
            selected={dateRange}
            onSelect={handleDateChange}
            numberOfMonths={2}
            locale={el}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}