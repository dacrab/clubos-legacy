import { LucideIcon } from "lucide-react"
import { Label } from "./label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import { cn } from "@/lib/utils"

interface SelectFieldProps {
  label: string
  icon?: LucideIcon
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  options: { value: string; label: string }[]
  className?: string
  required?: boolean
}

export function SelectField({
  label,
  icon: Icon,
  value,
  onValueChange,
  placeholder,
  options,
  className,
  required,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground z-10" />
        )}
        <Select
          value={value}
          onValueChange={onValueChange}
          required={required}
        >
          <SelectTrigger className={cn(Icon && "pl-8", className)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 