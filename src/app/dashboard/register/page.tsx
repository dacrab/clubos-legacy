import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { RegistersTable } from "@/components/registers/RegistersTable"

export default async function RegisterPage() {
  const supabase = await createClient()

  const { data: registers = [] } = await supabase
    .from("registers")
    .select(`
      id,
      closed_at,
      closed_by_name,
      items_sold,
      coupons_used,
      treat_items_sold,
      total_amount,
      sales(
        id,
        total_amount,
        sale_items(
          id,
          quantity,
          price_at_sale,
          is_treat,
          products(
            name
          )
        )
      )
    `)
    .order("closed_at", { ascending: false })

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Registers" 
        description="View all closed registers"
      />
      <RegistersTable registers={registers} />
    </DashboardShell>
  )
}