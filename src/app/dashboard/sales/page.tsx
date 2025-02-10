import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { SalesTable } from "@/components/sales/SalesTable"

export default async function SalesPage() {
  const supabase = await createClient()

  const { data: rawSales = [] } = await supabase
    .from("sales")
    .select(`
      id,
      register_id,
      total_amount,
      coupon_applied,
      created_by,
      created_at,
      updated_at,
      profiles!inner(name),
      registers!inner(coupons_used),
      sale_items(
        id,
        sale_id,
        product_id,
        quantity,
        price_at_sale,
        is_treat,
        created_at,
        products(
          name,
          last_edited_by,
          is_deleted
        )
      )
    `)
    .order("created_at", { ascending: false })

  // Transform the data to match the Sale type
  const sales = rawSales?.map((sale: any) => ({
    ...sale,
    profile: {
      name: sale.profiles.name
    },
    coupons_used: sale.registers.coupons_used
  })) ?? []

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Sales" 
        description="View all sales transactions"
      />
      <SalesTable sales={sales} />
    </DashboardShell>
  )
}