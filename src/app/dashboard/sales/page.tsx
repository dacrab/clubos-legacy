import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { SalesTable } from "@/components/sales/SalesTable"
import { Sale } from "@/types"

interface RawSale {
  id: string
  register_id: string
  total_amount: number
  coupon_applied: boolean
  created_by: string
  created_at: string
  updated_at: string
  profiles: {
    name: string
  }
  registers: {
    coupons_used: number
  }
  sale_items: Array<{
    id: string
    sale_id: string
    product_id: string
    quantity: number
    price_at_sale: number
    is_treat: boolean
    created_at: string
    last_edited_by: string | null
    last_edited_at: string | null
    is_deleted: boolean
    deleted_by: string | null
    deleted_at: string | null
    products: {
      name: string
    }
  }>
}

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
        last_edited_by,
        last_edited_at,
        is_deleted,
        deleted_by,
        deleted_at,
        products(
          name
        )
      )
    `)
    .order("created_at", { ascending: false })

  // Transform the data to match the Sale type
  const sales = rawSales?.map((sale: RawSale): Sale => ({
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