"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { el } from 'date-fns/locale/el';
import { CalendarIcon, X, Filter, ChevronDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { DATE_FORMAT, QUICK_SELECT_OPTIONS } from "@/lib/constants";
import { formatDateToYYYYMMDD } from "@/lib/utils";

interface DateRangeType {
  startDate: string;
  endDate: string;
  timeRange?: {
    startTime?: string;
    endTime?: string;
  };
}

interface StatisticsFilterProps {
  onFilterChange: (dateRange: DateRangeType) => void;
}

const STYLES = {
  filter: {
    button: "w-full flex items-center justify-between p-3",
    badge: "text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5",
    content: "grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-4",
    section: "w-full sm:col-span-1 lg:w-40 xl:w-52"
  },
  calendar: {
    button: "w-full mt-2 h-10 justify-start text-left font-normal text-sm",
    placeholder: "text-muted-foreground",
    content: "w-auto p-0"
  },
  clear: {
    button: "h-10 text-sm flex items-center gap-2 px-4 mt-2",
    icon: "h-4 w-4"
  }
} as const;

function getDateRange(value: string): { start: Date, end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const ranges: Record<string, { start: Date, end: Date }> = {
    TODAY: { 
      start: today,
      end: new Date()
    },
    YESTERDAY: {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 23, 59, 59)
    },
    THIS_WEEK: {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)),
      end: new Date()
    },
    LAST_WEEK: {
      start: new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() - 6),
      end: new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
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

  return ranges[value] || ranges.THIS_MONTH;
}

export default function StatisticsFilter({ onFilterChange }: StatisticsFilterProps) {
  const [date, setDate] = useState<DateRange>();
  const [quickSelect, setQuickSelect] = useState("THIS_MONTH");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const applyDateFilter = useCallback((from: Date, to: Date) => {
    setDate({ from, to });
    onFilterChange({
      startDate: formatDateToYYYYMMDD(from),
      endDate: formatDateToYYYYMMDD(to)
    });
  }, [onFilterChange]);

  const handleQuickSelectChange = useCallback((value: string) => {
    setQuickSelect(value);
    const { start, end } = getDateRange(value);
    applyDateFilter(start, end);
    setCalendarOpen(false);
  }, [applyDateFilter]);

  useEffect(() => {
    if (!date) {
      handleQuickSelectChange("THIS_MONTH");
    }
  }, [date, handleQuickSelectChange]);

  const handleDateChange = (range: DateRange | undefined) => {
    if (!range?.from) return;
    
    setDate(range);
    setQuickSelect("CUSTOM");
    applyDateFilter(range.from, range.to || range.from);
  };

  const handleClearFilter = () => {
    setDate(undefined);
    setQuickSelect("CUSTOM");
    setCalendarOpen(false);
    onFilterChange({ startDate: "", endDate: "" });
  };

  const FilterContent = () => (
    <div className={STYLES.filter.content}>
      <div className={STYLES.filter.section}>
        <Label className="text-sm font-medium">Γρήγορη επιλογή</Label>
        <Select value={quickSelect} onValueChange={handleQuickSelectChange}>
          <SelectTrigger className="mt-2 h-10 text-sm">
            <SelectValue placeholder="Επιλέξτε περίοδο" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(QUICK_SELECT_OPTIONS).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-sm py-2">{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className={STYLES.filter.section}>
        <Label className="text-sm font-medium">Εύρος ημερομηνιών</Label>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                STYLES.calendar.button,
                !date?.from && STYLES.calendar.placeholder
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  `${format(date.from, DATE_FORMAT.DISPLAY)} - ${format(date.to, DATE_FORMAT.DISPLAY)}`
                ) : (
                  format(date.from, DATE_FORMAT.DISPLAY)
                )
              ) : (
                "Επιλέξτε ημερομηνίες"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className={STYLES.calendar.content} align="start">
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

      <div className="flex items-end sm:col-span-2 lg:col-span-1">
        <Button
          variant="outline"
          onClick={handleClearFilter}
          className={STYLES.clear.button}
        >
          <X className={STYLES.clear.icon} />
          Καθαρισμός
        </Button>
      </div>
    </div>
  );

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
          <FilterContent />
        </div>
      )}
    </div>
  );
}
