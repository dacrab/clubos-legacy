import { cn } from "@/lib/utils"
import { HTMLAttributes } from "react"

export type DashboardShellProps = HTMLAttributes<HTMLDivElement>

export function DashboardShell({
  children,
  className,
  ...props
}: DashboardShellProps) {
  return (
    <div className={cn("grid items-start gap-8", className)} {...props}>
      {children}
    </div>
  )
} 