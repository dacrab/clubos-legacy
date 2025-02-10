import { createClient } from "@/lib/supabase/server"
import { RecentSales } from "@/components/dashboard/RecentSales"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function StaffDashboardPage() {
  const supabase = createClient()

  const { data: recentSales } = await supabase
    .from("sales")
    .select(`
      *,
      profiles:created_by(name),
      sale_items(
        quantity,
        price_at_sale,
        products(name)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Staff Dashboard"
        description="Overview of recent sales"
      >
        <Link href="/dashboard/sales/new">
          <Button>New Sale</Button>
        </Link>
      </DashboardHeader>
      <div className="grid gap-4">
        <RecentSales sales={recentSales} showEditStatus={false} />
      </div>
    </DashboardShell>
  )
} 