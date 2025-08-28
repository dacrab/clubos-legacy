"use client";

import { useState, useCallback, useEffect, memo } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, X, Filter } from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { DateRange as ReactDayPickerDateRange } from "react-day-picker";
import { DATE_FORMAT, QUICK_SELECT_OPTIONS } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DateRange } from "@/types/register";

interface RegisterClosingsFilterProps {
  onFilterChange: (dateRange: DateRange) => void;
}

// Define the quick select ranges outside the component to prevent recreation on each render
const QUICK_SELECT_RANGES = {
  TODAY: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return { start: today, end: new Date() };
  },
  YESTERDAY: () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return { start: yesterday, end: yesterday };
  },
  THIS_WEEK: () => {
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);
    return { start: startOfWeek, end: new Date() };
  },
  LAST_WEEK: () => {
    const today = new Date();
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    endOfWeek.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - 6);
    startOfWeek.setHours(0, 0, 0, 0);
    return { start: startOfWeek, end: endOfWeek };
  },
  THIS_MONTH: () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    return { start: startOfMonth, end: new Date() };
  },
  LAST_MONTH: () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    endOfMonth.setHours(0, 0, 0, 0);
    return { start: startOfMonth, end: endOfMonth };
  },
  THIS_YEAR: () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    startOfYear.setHours(0, 0, 0, 0);
    return { start: startOfYear, end: new Date() };
  },
  LAST_YEAR: () => {
    const startOfYear = new Date(new Date().getFullYear() - 1, 0, 1);
    startOfYear.setHours(0, 0, 0, 0);
    const endOfYear = new Date(new Date().getFullYear() - 1, 11, 31);
    endOfYear.setHours(0, 0, 0, 0);
    return { start: startOfYear, end: endOfYear };
  },
  CUSTOM: () => {
    return { start: new Date(), end: new Date() };
  },
};

function RegisterClosingsFilter({ onFilterChange }: RegisterClosingsFilterProps) {
  const [date, setDate] = useState<ReactDayPickerDateRange | undefined>();
  const [quickSelect, setQuickSelect] = useState<keyof typeof QUICK_SELECT_RANGES>("THIS_MONTH");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Memoize the date formatter to prevent unnecessary function creations
  const formatDateForAPI = useCallback((date: Date): string => 
    format(date, DATE_FORMAT.API), []);

  // Memoize the update filters function
  const updateFilters = useCallback(
    (from: Date, to: Date) => {
      setDate({ from, to });
      onFilterChange({
        startDate: formatDateForAPI(from),
        endDate: formatDateForAPI(to),
      });
    },
    [onFilterChange, formatDateForAPI]
  );

  // Memoize the quick select application function
  const applyQuickSelect = useCallback(
    (rangeKey: keyof typeof QUICK_SELECT_RANGES) => {
      const rangeFn = QUICK_SELECT_RANGES[rangeKey];
      if (!rangeFn) return;

      const { start, end } = rangeFn();
      setDate({ from: start, to: end });
      setQuickSelect(rangeKey);
      updateFilters(start, end);
    },
    [updateFilters]
  );

  // Only run once on initial render with stable dependencies
  useEffect(() => {
    applyQuickSelect("THIS_MONTH");
  }, [applyQuickSelect]);

  // Memoize the date change handler
  const handleDateChange = useCallback(
    (range: ReactDayPickerDateRange | undefined) => {
      if (!range?.from) return;

      setDate(range);
      setQuickSelect("CUSTOM");
      updateFilters(range.from, range.to || range.from);
    },
    [updateFilters]
  );

  // Memoize the clear filter handler
  const handleClearFilter = useCallback(() => {
    setDate(undefined);
    setQuickSelect("THIS_MONTH");
    onFilterChange({ startDate: "", endDate: "" });
  }, [onFilterChange]);

  // Handle filter open/close with callback
  const toggleFilterOpen = useCallback(() => 
    setIsFilterOpen(prev => !prev), []);

  // Memoize the filter content to prevent unnecessary re-renders
  const FilterContent = memo(() => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-4">
      <div className="w-full sm:col-span-1 lg:w-40">
        <Label className="text-sm font-medium">Γρήγορη επιλογή</Label>
        <Select value={quickSelect} onValueChange={(value) => applyQuickSelect(value as keyof typeof QUICK_SELECT_RANGES)}>
          <SelectTrigger className="mt-2 h-10 text-sm">
            <SelectValue placeholder="Επιλέξτε περίοδο" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(QUICK_SELECT_OPTIONS).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-sm py-2">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:col-span-1 lg:w-52 xl:w-60">
        <Label className="text-sm font-medium">Εύρος ημερομηνιών</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full mt-2 h-10 justify-start text-left font-normal text-sm",
                !date?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
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
              className="p-3 scale-100"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-end mt-2 sm:col-span-2 lg:col-span-1">
        <Button
          variant="outline"
          onClick={handleClearFilter}
          className="h-10 text-sm flex items-center gap-2 px-4"
        >
          <X className="h-4 w-4" />
          Καθαρισμός
        </Button>
      </div>
    </div>
  ));
  
  // Only rerender FilterContent when dependencies change
  FilterContent.displayName = 'FilterContent';

  return (
    <div className="bg-muted/50 rounded-lg border overflow-hidden">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Φίλτρα</span>
        </div>
        <Button
          variant="ghost"
          onClick={toggleFilterOpen}
          className="h-9 px-3 text-sm min-w-[100px]"
        >
          {isFilterOpen ? "Απόκρυψη" : "Εμφάνιση"}
        </Button>
      </div>
      {isFilterOpen && (
        <div className="p-4">
          <FilterContent />
        </div>
      )}
    </div>
  );
}

export default memo(RegisterClosingsFilter);