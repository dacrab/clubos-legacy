import { createClient } from "@/lib/supabase/server"
import { SalesPanel } from "@/components/sales/SalesPanel"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

export default async function NewSalePage() {
  const supabase = await createClient()
  const { data: products = [] } = await supabase
    .from("products")
    .select("*")
    .order("name")

  return (
    <DashboardShell>
      <DashboardHeader
        heading="New Sale" 
        description="Create a new sale by selecting products from the catalog"
      />
      <SalesPanel products={products} />
    </DashboardShell>
  )
}