import { LucideIcon } from "lucide-react"
import { Label } from "./label"
import { Input } from "./input"
import { cn } from "@/lib/utils"

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: LucideIcon
}

export function FormField({ label, icon: Icon, className, ...props }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        )}
        <Input
          className={cn(Icon && "pl-8", className)}
          {...props}
        />
      </div>
    </div>
  )
} 