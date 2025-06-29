"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { 
  addDays,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isSameDay,
  setDay
} from "date-fns"
import { format } from 'date-fns-tz'
import { el } from 'date-fns/locale/el'
import { cn, eachDayOfInterval } from "@/lib/utils"
import type { DateRange } from "react-day-picker"

// Types
interface CalendarProps {
  mode?: "single" | "range"
  selected?: Date | DateRange | undefined
  onSelect?: ((date: DateRange | undefined) => void) | ((date: Date | undefined) => void)
  className?: string
  defaultMonth?: Date
  numberOfMonths?: number
  locale?: typeof el
  initialFocus?: boolean
}

// Helpers
const formatWithLocale = (date: Date, formatStr: string) => {
  switch (formatStr) {
    case 'EE':
      return new Intl.DateTimeFormat('el', { weekday: 'short' }).format(date)
    case 'LLLL yyyy':
      return new Intl.DateTimeFormat('el', { month: 'long', year: 'numeric' }).format(date)
    case 'd':
      return new Intl.DateTimeFormat('el', { day: 'numeric' }).format(date)
    default:
      return format(date, formatStr) // fallback to date-fns format
  }
}

export function Calendar({ 
  mode = "single",
  selected,
  onSelect,
  className,
  defaultMonth,
}: CalendarProps) {
  // State
  const [currentMonth, setCurrentMonth] = React.useState(defaultMonth || new Date())
  const today = new Date()

  // Calendar calculations
  const firstDayOfMonth = startOfMonth(currentMonth)
  const lastDayOfMonth = endOfMonth(currentMonth)
  
  const daysInMonth: Date[] = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth })

  const monday = setDay(new Date(2024, 0, 1), 1)
  const weekDays = Array.from({ length: 7 }, (_, i: number) => {
    const date = addDays(monday, i)
    return formatWithLocale(date, "EE")
  })

  const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7
  const emptyCells = Array(firstDayOfWeek).fill(null)

  // Handlers
  const handlePreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1))
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1))
  
  const handleSelectDate = (date: Date) => {
    if (mode === "single") {
      (onSelect as ((date: Date | undefined) => void))?.(date)
      return
    }
    
    const range = selected as DateRange | undefined
    
    if (!range?.from) {
      (onSelect as ((date: DateRange | undefined) => void))?.(
        { from: date, to: undefined }
      )
    } else if (!range.to) {
      (onSelect as ((date: DateRange | undefined) => void))?.(
        date < range.from 
          ? { from: date, to: range.from }
          : { from: range.from, to: date }
      )
    } else {
      (onSelect as ((date: DateRange | undefined) => void))?.(
        { from: date, to: undefined }
      )
    }
  }

  const isDateSelected = (date: Date) => {
    if (!selected) return false
    
    if (mode === "single") {
      return isSameDay(date, selected as Date)
    }
    
    const range = selected as DateRange
    if (!range?.from) return false
    if (!range.to) return isSameDay(date, range.from)
    return (date >= range.from && date <= range.to)
  }

  return (
    <div className={cn("p-3 space-y-4 bg-background rounded-lg shadow-sm", className)}>
      {/* Header */}
      <div className="relative flex items-center justify-center">
        <button
          onClick={handlePreviousMonth}
          className="absolute left-1 p-1 rounded-md hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-sm font-medium">
          {formatWithLocale(currentMonth, "LLLL yyyy")}
        </div>
        <button
          onClick={handleNextMonth}
          className="absolute right-1 p-1 rounded-md hover:bg-accent"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map((day: string, i: number) => (
          <div
            key={i}
            className="h-8 flex items-center justify-center text-sm text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {/* Empty cells */}
        {emptyCells.map((_, i: number) => (
          <div key={`empty-${i}`} className="h-9" />
        ))}

        {/* Days */}
        {daysInMonth.map((day: Date) => {
          const isSelected = isDateSelected(day)
          const isToday = isSameDay(day, today)
          const isCurrentMonth = isSameMonth(day, currentMonth)

          return (
            <button
              key={day.toString()}
              onClick={() => handleSelectDate(day)}
              className={cn(
                "h-9 w-9 rounded-md flex items-center justify-center text-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                !isSelected && isToday && "border border-primary/50 text-foreground",
                !isCurrentMonth && "text-muted-foreground opacity-50"
              )}
            >
              {formatWithLocale(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}