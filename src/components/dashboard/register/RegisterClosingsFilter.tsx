"use client";

import { format } from "date-fns";
import { el } from "date-fns/locale";
import { CalendarIcon, X, Filter } from "lucide-react";
import { useState, useCallback, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Calendar, type DateRange as ReactDayPickerDateRange } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DATE_FORMAT, QUICK_SELECT_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/types/register";

interface RegisterClosingsFilterProps {
  onFilterChange: (dateRange: DateRange) => void;
}

const getDateRange = (type: string) => {
    const today = new Date();
  const start = new Date();
  // removed unused end date

  switch (type) {
    case "TODAY":
      start.setHours(0, 0, 0, 0);
      return { start, end: today };
    
    case "YESTERDAY":
      start.setDate(today.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      return { start, end: start };
    
    case "THIS_WEEK": {
      const dayOfWeek = today.getDay();
      start.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
      start.setHours(0, 0, 0, 0);
      return { start, end: today };
    }
    
    case "LAST_WEEK": {
      const lastWeekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
      const lastWeekStart = new Date(lastWeekEnd);
      lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
      lastWeekEnd.setHours(0, 0, 0, 0);
      lastWeekStart.setHours(0, 0, 0, 0);
      return { start: lastWeekStart, end: lastWeekEnd };
    }
    
    case "THIS_MONTH":
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return { start, end: today };
    
    case "LAST_MONTH": {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      lastMonth.setHours(0, 0, 0, 0);
      lastMonthEnd.setHours(0, 0, 0, 0);
      return { start: lastMonth, end: lastMonthEnd };
    }
    
    case "THIS_YEAR":
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
      return { start, end: today };
    
    case "LAST_YEAR": {
      const lastYear = new Date(today.getFullYear() - 1, 0, 1);
      const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
      lastYear.setHours(0, 0, 0, 0);
      lastYearEnd.setHours(0, 0, 0, 0);
      return { start: lastYear, end: lastYearEnd };
    }
    
    default:
      return { start: today, end: today };
  }
};

function RegisterClosingsFilter({ onFilterChange }: RegisterClosingsFilterProps) {
  const [dateRange, setDateRange] = useState<ReactDayPickerDateRange>();
  const [selectedQuickOption, setSelectedQuickOption] = useState("THIS_MONTH");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const applyDateRange = useCallback((startDate: Date, endDate: Date) => {
    setDateRange({ from: startDate, to: endDate });
      onFilterChange({
      startDate: format(startDate, DATE_FORMAT.API),
      endDate: format(endDate, DATE_FORMAT.API),
      });
  }, [onFilterChange]);

  const handleQuickSelect = useCallback((option: string) => {
    setSelectedQuickOption(option);
    const { start, end } = getDateRange(option);
    applyDateRange(start, end);
  }, [applyDateRange]);

  const handleDateSelect = useCallback((range: ReactDayPickerDateRange | undefined) => {
    if (!range?.from) {return;}
    
    setDateRange(range);
    setSelectedQuickOption("CUSTOM");
    applyDateRange(range.from, range.to || range.from);
  }, [applyDateRange]);
  const handleClear = useCallback(() => {
    setDateRange(undefined);
    setSelectedQuickOption("THIS_MONTH");
    onFilterChange({ startDate: "", endDate: "" });
  }, [onFilterChange]);

  useEffect(() => {
    handleQuickSelect("THIS_MONTH");
  }, [handleQuickSelect]);

  const formatDisplayDate = (from?: Date, to?: Date) => {
    if (!from) {return "Επιλέξτε ημερομηνίες";}
    if (!to) {return format(from, DATE_FORMAT.DISPLAY);}
    return `${format(from, DATE_FORMAT.DISPLAY)} - ${format(to, DATE_FORMAT.DISPLAY)}`;
  };
  return (
    <div className="bg-muted/50 rounded-lg border overflow-hidden">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Φίλτρα</span>
        </div>
        <Button
          variant="ghost"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="h-9 px-3 text-sm min-w-[100px]"
        >
          {isFilterOpen ? "Απόκρυψη" : "Εμφάνιση"}
        </Button>
      </div>
      
      {isFilterOpen && (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-4">
            <div className="w-full sm:col-span-1 lg:w-40">
              <Label className="text-sm font-medium">Γρήγορη επιλογή</Label>
              <Select value={selectedQuickOption} onValueChange={handleQuickSelect}>
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
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full mt-2 h-10 justify-start text-left font-normal text-sm",
                      !dateRange?.from && "text-muted-foreground"
      )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDisplayDate(dateRange?.from, dateRange?.to)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from || new Date()}
                    selected={dateRange}
                    onSelect={handleDateSelect}
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
                onClick={handleClear}
                className="h-10 text-sm flex items-center gap-2 px-4"
              >
                <X className="h-4 w-4" />
                Καθαρισμός
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegisterClosingsFilter;
