"use client";

import { format } from "date-fns";
import { el } from 'date-fns/locale/el';
import { CalendarIcon, X, Filter } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Calendar, type DateRange } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FilterState {
  dateRange?: DateRange;
  startTime: string;
  endTime: string;
  quickSelect: string;
}

const QUICK_OPTIONS = {
  CUSTOM: "Προσαρμοσμένο",
  TODAY: "Σήμερα",
  YESTERDAY: "Χθες",
  THIS_WEEK: "Αυτή την εβδομάδα",
  LAST_WEEK: "Προηγούμενη εβδομάδα",
  THIS_MONTH: "Αυτόν τον μήνα",
  LAST_MONTH: "Προηγούμενο μήνα"
};

const getQuickSelectRange = (option: string): DateRange | undefined => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (option) {
    case 'TODAY':
      return { from: today, to: today };
    case 'YESTERDAY': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return { from: yesterday, to: yesterday };
    }
    case 'THIS_WEEK': {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1);
      return { from: weekStart, to: today };
    }
    case 'LAST_WEEK': {
      const lastWeekEnd = new Date(today);
      lastWeekEnd.setDate(today.getDate() - today.getDay());
      const lastWeekStart = new Date(lastWeekEnd);
      lastWeekStart.setDate(lastWeekEnd.getDate() - 6);
      return { from: lastWeekStart, to: lastWeekEnd };
    }
    case 'THIS_MONTH':
      return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: today };
    case 'LAST_MONTH': {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      return { from: lastMonth, to: lastMonthEnd };
    }
    default:
      return undefined;
  }
};

export default function SalesFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    startTime: "",
    endTime: "",
    quickSelect: "CUSTOM"
  });
  const [isOpen, setIsOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const startTime = searchParams.get('startTime') || "";
    const endTime = searchParams.get('endTime') || "";

    const dateRange = from ? {
      from: new Date(from),
      to: to ? new Date(to) : new Date(from)
    } : undefined;

    setFilters({
      dateRange,
      startTime,
      endTime,
      quickSelect: "CUSTOM"
        });

    setIsOpen(!!(from || to || startTime || endTime));
  }, [searchParams]);
  
  const updateUrl = (newFilters: FilterState) => {
    const params = new URLSearchParams();
    
    if (newFilters.dateRange?.from) {
      params.set('from', format(newFilters.dateRange.from, 'yyyy-MM-dd'));
      if (newFilters.dateRange.to) {
        params.set('to', format(newFilters.dateRange.to, 'yyyy-MM-dd'));
      }
    }
    
    if (newFilters.startTime) {params.set('startTime', newFilters.startTime);}
    if (newFilters.endTime) {params.set('endTime', newFilters.endTime);}
    router.push(`${pathname}?${params.toString()}`);
    };
    
  const handleQuickSelect = (value: string) => {
    const dateRange = getQuickSelectRange(value);
    const newFilters = {
      ...filters,
      dateRange,
      quickSelect: value,
      startTime: value !== "CUSTOM" ? "00:00" : filters.startTime,
      endTime: value !== "CUSTOM" ? "23:59" : filters.endTime
  };

    setFilters(newFilters);
    updateUrl(newFilters);
  };

  const handleDateChange = (dateRange: DateRange | undefined) => {
    const newFilters = { ...filters, dateRange, quickSelect: "CUSTOM" };
    setFilters(newFilters);
    updateUrl(newFilters);
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    const newFilters = { ...filters, [field]: value, quickSelect: "CUSTOM" };
    setFilters(newFilters);
    updateUrl(newFilters);
  };
  const clearFilters = () => {
    const newFilters = {
      dateRange: undefined,
      startTime: "",
      endTime: "",
      quickSelect: "CUSTOM"
    };
    setFilters(newFilters);
    setCalendarOpen(false);
    router.push(pathname);
  };

  const formatDateRange = () => {
    if (!filters.dateRange?.from) {return "Επιλέξτε ημερομηνίες";}
    
    const from = format(filters.dateRange.from, 'dd/MM/yyyy');
    const to = filters.dateRange.to ? format(filters.dateRange.to, 'dd/MM/yyyy') : from;
    
    return from === to ? from : `${from} - ${to}`;
  };
  return (
    <div className="bg-muted/50 rounded-lg border">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Φίλτρα</span>
        </div>
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="h-9 px-3"
        >
          {isOpen ? "Απόκρυψη" : "Εμφάνιση"}
        </Button>
      </div>
      {isOpen && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label>Γρήγορη επιλογή</Label>
              <Select value={filters.quickSelect} onValueChange={handleQuickSelect}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(QUICK_OPTIONS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
    </div>

            <div>
              <Label>Εύρος ημερομηνιών</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full mt-2 justify-start text-left font-normal",
                      !filters.dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatDateRange()}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={filters.dateRange}
                    onSelect={handleDateChange}
                    numberOfMonths={2}
                    locale={el}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Από ώρα</Label>
              <Input
                type="time"
                value={filters.startTime}
                onChange={(e) => handleTimeChange("startTime", e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Έως ώρα</Label>
              <Input
                type="time"
                value={filters.endTime}
                onChange={(e) => handleTimeChange("endTime", e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={clearFilters} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Καθαρισμός
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
