import { cn } from "@/lib/utils"
import { DashboardHeaderProps } from "@/types/app"

export function DashboardHeader({
  heading,
  description,
  children,
  className,
  ...props
}: DashboardHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <div className="grid gap-1">
        <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
        {description && (
          <p className="text-lg text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
} 