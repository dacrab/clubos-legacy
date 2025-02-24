import { LucideIcon } from "lucide-react"
import * as React from "react"
import { DateRange } from "react-day-picker"
import * as SheetPrimitive from "@radix-ui/react-dialog"

// Basic HTML Element Types
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>
export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void
}

// Button Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

// Form Types
export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: LucideIcon
  name?: string
  type?: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  min?: string | number
  max?: string | number
  step?: string | number
}

export interface SelectFieldProps {
  label: string
  icon?: LucideIcon
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  options: { value: string; label: string }[]
  className?: string
  required?: boolean 
}

// Date Related Types
export interface CalendarProps {
  mode?: "single" | "range" | "multiple"
  selected?: Date | Date[] | undefined
  onSelect?: (date: Date | undefined) => void
  disabled?: (date: Date) => boolean
  initialFocus?: boolean
  numberOfMonths?: number
  className?: string
}

export interface DatePickerProps {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
  className?: string
}

export interface DateRangePickerProps {
  className?: string
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  align?: "start" | "center" | "end"
}

export interface TableDateFilterProps {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  onClearFilter: () => void
  className?: string
}

// Sheet Types
export type SheetProps = SheetPrimitive.DialogProps
export type SheetTriggerProps = SheetPrimitive.DialogTriggerProps

export interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> {
  side?: "top" | "bottom" | "left" | "right"
}

export interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export interface SheetFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string
}

export interface SheetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string
}