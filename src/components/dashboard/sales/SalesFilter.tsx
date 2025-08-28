"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { el } from 'date-fns/locale/el';
import { CalendarIcon, X, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { DATE_FORMAT, QUICK_SELECT_OPTIONS } from "@/lib/constants";

interface SalesDateRange {
  startDate: string;
  endDate: string;
}

interface TimeRange {
  startTime: string;
  endTime: string;
}

interface SalesFilterProps {
  onFilterChange: (dateRange: SalesDateRange, timeRange: TimeRange) => void;
}

const getDateRangeForQuickSelect = (value: string): { start: Date, end: Date } | null => {
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));

  const ranges = {
    TODAY: {
      start: today,
      end: new Date()
    },
    YESTERDAY: {
      start: new Date(today.setDate(today.getDate() - 1)),
      end: new Date(today.setHours(23, 59, 59, 999))
    },
    THIS_WEEK: {
      start: new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1))),
      end: new Date()
    },
    LAST_WEEK: {
      start: new Date(today.setDate(today.getDate() - today.getDay() - 6)),
      end: new Date(new Date(today).setDate(today.getDate() + 6))
    },
    THIS_MONTH: {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: new Date()
    },
    LAST_MONTH: {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0)
    },
    THIS_YEAR: {
      start: new Date(today.getFullYear(), 0, 1),
      end: new Date()
    },
    LAST_YEAR: {
      start: new Date(today.getFullYear() - 1, 0, 1),
      end: new Date(today.getFullYear() - 1, 11, 31)
    }
  };

  return ranges[value as keyof typeof ranges] || null;
};

const isValidTimeFormat = (time: string) => {
  if (!time) return true;
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
};

export default function SalesFilter({ onFilterChange }: SalesFilterProps) {
  const [date, setDate] = useState<DateRange>();
  const [timeRange, setTimeRange] = useState<TimeRange>({ startTime: "", endTime: "" });
  const [quickSelect, setQuickSelect] = useState("CUSTOM");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const updateFilters = useCallback((dateRange: SalesDateRange, timeRange: TimeRange) => {
    onFilterChange(dateRange, timeRange);
  }, [onFilterChange]);

  const handleQuickSelectChange = useCallback((value: string) => {
    const range = getDateRangeForQuickSelect(value);
    if (!range) return;

    const { start, end } = range;
    const newTimeRange = {
      startTime: "00:00",
      endTime: value === "TODAY" ? format(new Date(), "HH:mm") : "23:59"
    };

    setDate({ from: start, to: end });
    setTimeRange(newTimeRange);
    setQuickSelect(value);
    setCalendarOpen(false);

    updateFilters(
      {
        startDate: format(start, DATE_FORMAT.API),
        endDate: format(end, DATE_FORMAT.API)
      },
      newTimeRange
    );
  }, [updateFilters]);

  useEffect(() => {
    if (!date) {
      handleQuickSelectChange("THIS_MONTH");
    }
  }, [date, handleQuickSelectChange]);

  const handleDateChange = (range: DateRange | undefined) => {
    if (!range?.from) return;
    
    setDate(range);
    setQuickSelect("CUSTOM");

    updateFilters(
      {
        startDate: format(range.from, DATE_FORMAT.API),
        endDate: format(range.to || range.from, DATE_FORMAT.API)
      },
      timeRange
    );
  };

  const handleTimeChange = (field: keyof TimeRange, value: string) => {
    if (value.length > 5) return;

    const newTimeRange = { ...timeRange, [field]: value };
    setTimeRange(newTimeRange);
    setQuickSelect("CUSTOM");

    if (!isValidTimeFormat(value)) return;

    updateFilters(
      {
        startDate: date?.from ? format(date.from, DATE_FORMAT.API) : "",
        endDate: date?.to ? format(date.to, DATE_FORMAT.API) : date?.from ? format(date.from, DATE_FORMAT.API) : ""
      },
      {
        startTime: newTimeRange.startTime || "00:00",
        endTime: newTimeRange.endTime || "23:59"
      }
    );
  };

  const handleClearFilter = () => {
    setDate(undefined);
    setTimeRange({ startTime: "", endTime: "" });
    setQuickSelect("CUSTOM");
    setCalendarOpen(false);
    updateFilters(
      { startDate: "", endDate: "" },
      { startTime: "", endTime: "" }
    );
  };

  const FilterContent = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-4 sm:gap-5">
      <div className="w-full sm:col-span-1 lg:w-40">
        <Label className="text-sm sm:text-base font-medium">Γρήγορη επιλογή</Label>
        <Select value={quickSelect} onValueChange={handleQuickSelectChange}>
          <SelectTrigger className="mt-2 h-11 sm:h-12 text-sm sm:text-base">
            <SelectValue placeholder="Επιλέξτε περίοδο" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(QUICK_SELECT_OPTIONS).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-sm sm:text-base py-2">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:col-span-1 lg:w-52 xl:w-60">
        <Label className="text-sm sm:text-base font-medium">Εύρος ημερομηνιών</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full mt-2 h-11 sm:h-12 justify-start text-left font-normal text-sm sm:text-base",
                !date?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, DATE_FORMAT.DISPLAY)} -{" "}
                    {format(date.to, DATE_FORMAT.DISPLAY)}
                  </>
                ) : (
                  format(date.from, DATE_FORMAT.DISPLAY)
                )
              ) : (
                "Επιλέξτε ημερομηνίες"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from || new Date()}
              selected={date}
              onSelect={handleDateChange}
              numberOfMonths={window.innerWidth < 768 ? 1 : 2}
              locale={el}
              className="p-3 sm:p-4 scale-100"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-4 w-full sm:col-span-2 lg:w-auto lg:flex-none">
        <div className="flex-1 lg:w-24">
          <Label className="text-sm sm:text-base font-medium">Από ώρα</Label>
          <Input
            type="text"
            placeholder="HH:mm"
            value={timeRange.startTime}
            onChange={(e) => handleTimeChange("startTime", e.target.value)}
            className={cn(
              "mt-2 h-11 sm:h-12 text-sm sm:text-base",
              timeRange.startTime && !isValidTimeFormat(timeRange.startTime) && "border-red-500"
            )}
          />
        </div>

        <div className="flex-1 lg:w-24">
          <Label className="text-sm sm:text-base font-medium">Έως ώρα</Label>
          <Input
            type="text"
            placeholder="HH:mm"
            value={timeRange.endTime}
            onChange={(e) => handleTimeChange("endTime", e.target.value)}
            className={cn(
              "mt-2 h-11 sm:h-12 text-sm sm:text-base",
              timeRange.endTime && !isValidTimeFormat(timeRange.endTime) && "border-red-500"
            )}
          />
        </div>
      </div>

      <div className="flex items-end mt-2 sm:col-span-2 lg:col-span-1">
        <Button
          variant="outline"
          onClick={handleClearFilter}
          className="h-11 sm:h-12 text-sm sm:text-base flex items-center gap-2 px-4"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
          Καθαρισμός
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-muted/50 rounded-lg border overflow-hidden">
      <div className="px-4 sm:px-5 py-3 sm:py-4 border-b flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          <span className="text-sm sm:text-base font-medium">Φίλτρα</span>
        </div>
        <Button
          variant="ghost"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="h-9 sm:h-10 px-3 sm:px-4 text-sm sm:text-base min-w-[100px]"
        >
          {isFilterOpen ? "Απόκρυψη" : "Εμφάνιση"}
        </Button>
      </div>
      {isFilterOpen && (
        <div className="p-4 sm:p-5">
          <FilterContent />
        </div>
      )}
    </div>
  );
}
