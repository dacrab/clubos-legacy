import { createClient } from "@/lib/supabase/server"
import { RecentSales } from "@/components/dashboard/RecentSales"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { NewSaleDialog } from "@/components/sales/NewSaleDialog"
import { CloseRegisterDialog } from "@/components/registers/CloseRegisterDialog"
import { redirect } from "next/navigation"

export default async function StaffDashboardPage() {
  const supabase = await createClient()

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect("/auth/sign-in")
  }

  // Verify user exists in profiles and has correct role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile || !["admin", "staff"].includes(profile.role)) {
    redirect("/auth/sign-in")
  }

  // Fetch dashboard data
  const [{ data: recentSales, error: salesError }, { data: activeRegister, error: registerError }] = await Promise.all([
    supabase
      .from("sales")
      .select(`
        *,
        profile:created_by(name),
        sale_items(
          quantity,
          price_at_sale,
          products(
            name,
            last_edited_by,
            is_deleted
          )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5),
    
    supabase
      .from("registers")
      .select("id, items_sold, coupons_used, treat_items_sold, total_amount")
      .is("closed_at", null)
      .single()
  ])

  if (salesError) {
    console.error("Error fetching sales:", salesError)
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Staff Dashboard"
        description="Overview of recent sales"
      >
        <div className="flex items-center gap-4">
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
      <div className="grid gap-4">
        <RecentSales sales={recentSales} showEditStatus={false} />
      </div>
    </DashboardShell>
  )
} 