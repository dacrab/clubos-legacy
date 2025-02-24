import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import type { SelectFieldProps } from "@/types/components"

export function SelectField({ 
  label, 
  icon: Icon, 
  value, 
  onValueChange, 
  placeholder, 
  options, 
  className,
  required = false 
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange} required={required}>
        <SelectTrigger className={cn(Icon && "pl-9", className)}>
          {Icon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 