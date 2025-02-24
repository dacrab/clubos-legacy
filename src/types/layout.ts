import { ReactNode } from "react"
import { HTMLAttributes } from "react"

// Root Layout Types
export interface RootLayoutProps {
  children: ReactNode
}

// Dashboard Layout Types
export interface DashboardLayoutProps {
  children: ReactNode
}

export interface StaffLayoutProps {
  children: ReactNode
}

// Dashboard Header Types
export interface DashboardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  heading: string
  description?: string
  children?: ReactNode
} 