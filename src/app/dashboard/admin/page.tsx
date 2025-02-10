import { createClient } from "@/lib/supabase/server"
import { RecentSales } from "@/components/dashboard/RecentSales"
import { LowStockProducts } from "@/components/dashboard/LowStockProducts"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { CloseRegisterDialog } from "@/components/registers/CloseRegisterDialog"
import { NewSaleDialog } from "@/components/sales/NewSaleDialog"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [{ data: recentSales }, { data: lowStockProducts }, { data: activeRegister }] = await Promise.all([
    supabase
      .from("sales")
      .select(`
        *,
        profiles:created_by(name),
        sale_items(quantity, price_at_sale, products(name))
      `)
      .order("created_at", { ascending: false })
      .limit(5),
    
    supabase
      .from("products") 
      .select("*")
      .lt("stock", 10)
      .eq("is_deleted", false)
      .order("stock", { ascending: true }),

    supabase
      .from("registers")
      .select("id, items_sold, coupons_used, treat_items_sold, total_amount")
      .is("closed_at", null)
      .single()
  ])

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Admin Dashboard"
        description="Overview of recent sales and low stock products"
      >
        <div className="flex gap-4">
          <NewSaleDialog />
          {activeRegister && (
            <CloseRegisterDialog
              activeRegisterId={activeRegister.id}
              totalAmount={activeRegister.total_amount}
              itemsSold={activeRegister.items_sold}
              couponsUsed={activeRegister.coupons_used}
              treatsCount={activeRegister.treat_items_sold}
            />
          )}
        </div>
      </DashboardHeader>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RecentSales sales={recentSales} className="col-span-4" />
        <LowStockProducts products={lowStockProducts} className="col-span-3" />
      </div>
    </DashboardShell>
  )
}