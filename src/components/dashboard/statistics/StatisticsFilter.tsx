"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { el } from 'date-fns/locale/el';
import { CalendarIcon, X, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { DATE_FORMAT, QUICK_SELECT_OPTIONS } from "@/lib/constants";
import { formatDateToYYYYMMDD } from "@/lib/utils/date";

interface DateRangeType {
  startDate: string;
  endDate: string;
}

interface StatisticsFilterProps {
  onFilterChange: (dateRange: DateRangeType) => void;
}

const getQuickSelectRange = (option: string): { from: Date; to: Date } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (option) {
    case "TODAY":
      return { from: today, to: new Date() };
    case "YESTERDAY":
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { from: yesterday, to: yesterday };
    case "THIS_WEEK":
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1);
      return { from: weekStart, to: new Date() };
    case "LAST_WEEK":
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - today.getDay() - 6);
      const lastWeekEnd = new Date(today);
      lastWeekEnd.setDate(today.getDate() - today.getDay());
      return { from: lastWeekStart, to: lastWeekEnd };
    case "THIS_MONTH":
      return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: new Date() };
    case "LAST_MONTH":
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: lastMonthStart, to: lastMonthEnd };
    case "THIS_YEAR":
      return { from: new Date(today.getFullYear(), 0, 1), to: new Date() };
    case "LAST_YEAR":
      const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
      const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
      return { from: lastYearStart, to: lastYearEnd };
    default:
      return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: new Date() };
  }
};

export default function StatisticsFilter({ onFilterChange }: StatisticsFilterProps) {
  const [selectedRange, setSelectedRange] = useState<DateRange>();
  const [quickSelect, setQuickSelect] = useState("THIS_MONTH");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const applyFilter = (from: Date, to: Date) => {
    setSelectedRange({ from, to });
    onFilterChange({
      startDate: formatDateToYYYYMMDD(from),
      endDate: formatDateToYYYYMMDD(to)
    });
  };

  const handleQuickSelect = (value: string) => {
    setQuickSelect(value);
    const { from, to } = getQuickSelectRange(value);
    applyFilter(from, to);
    setIsCalendarOpen(false);
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (!range?.from) return;
    
    setSelectedRange(range);
    setQuickSelect("CUSTOM");
    applyFilter(range.from, range.to || range.from);
  };

  const clearFilters = () => {
    setSelectedRange(undefined);
    setQuickSelect("CUSTOM");
    setIsCalendarOpen(false);
    onFilterChange({ startDate: "", endDate: "" });
  };

  useEffect(() => {
    if (!selectedRange) {
      handleQuickSelect("THIS_MONTH");
    }
  }, [selectedRange]);

  return (
    <div className="bg-muted/50 rounded-lg border">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Φίλτρα</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Απόκρυψη" : "Εμφάνιση"}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Γρήγορη επιλογή</Label>
              <Select value={quickSelect} onValueChange={handleQuickSelect}>
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
              <Label className="text-sm font-medium">Εύρος ημερομηνιών</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedRange?.from ? (
                      selectedRange.to ? (
                        `${format(selectedRange.from, DATE_FORMAT.DISPLAY)} - ${format(selectedRange.to, DATE_FORMAT.DISPLAY)}`
                      ) : (
                        format(selectedRange.from, DATE_FORMAT.DISPLAY)
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
                    defaultMonth={selectedRange?.from}
                    selected={selectedRange}
                    onSelect={handleDateRangeSelect}
                    numberOfMonths={2}
                    locale={el}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Καθαρισμός
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
