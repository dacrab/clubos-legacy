"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { StaffLayout } from "@/components/layout/StaffLayout"
import { usePathname } from "next/navigation"

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Use StaffLayout for staff dashboard
  if (pathname === "/dashboard/staff") {
    return <StaffLayout>{children}</StaffLayout>
  }

  return <DashboardLayout>{children}</DashboardLayout>
} 