"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { cn } from "@/lib/utils"
import type { TableDateFilterProps } from "@/types/components"

export function TableDateFilter({
  date,
  onDateChange,
  onClearFilter,
  className
}: TableDateFilterProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DateRangePicker
        date={date}
        onDateChange={onDateChange}
        align="end"
      />
      {date && (
        <Button
          variant="ghost"
          onClick={onClearFilter}
          className="px-2 h-8"
        >
          Reset
        </Button>
      )}
    </div>
  )
} 