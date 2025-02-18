"use client"

import * as React from "react"
import { Filter, X } from "lucide-react"
import { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { DateRangePickerWithPresets } from "@/components/ui/date-range-picker"

interface TableDateFilterProps {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  onClearFilter: () => void
  className?: string
}

export function TableDateFilter({
  date,
  onDateChange,
  onClearFilter,
  className
}: TableDateFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <DateRangePickerWithPresets
        date={date}
        onDateChange={onDateChange}
        className={className}
      />
      {date && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClearFilter}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear date filter</span>
        </Button>
      )}
    </div>
  )
} 