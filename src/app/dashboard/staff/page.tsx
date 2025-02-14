import { createClient } from "@/lib/supabase/server"
import { RecentSales } from "@/components/dashboard/RecentSales"
import { NewSaleDialog } from "@/components/sales/NewSaleDialog"
import { CloseRegisterDialog } from "@/components/registers/CloseRegisterDialog"
import { redirect } from "next/navigation"
import { SignOutButton } from "@/components/SignOutButton"

interface Product {
  id: string
  name: string
  is_deleted: boolean
}

interface SaleItem {
  id: string
  quantity: number
  price_at_sale: number
  product: Product
}

interface SaleData {
  id: string
  created_at: string
  total_amount: number
  created_by: string
  sale_items: SaleItem[]
  coupon_applied: boolean
  coupons_used: number
  coupons_count: number
}

export default async function StaffDashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError) redirect("/auth/sign-in")

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", user.id)
    .single()

  if (!profile || profileError || !["admin", "staff"].includes(profile.role)) {
    redirect("/auth/sign-in")
  }

  const { data: salesData } = await supabase
    .from("sales")
    .select(`
      id,
      created_at,
      created_by,
      total_amount,
      coupon_applied,
      coupons_used,
      sale_items(
        id,
        quantity,
        price_at_sale,
        product:products!inner(
          id,
          name,
          is_deleted
        )
      )
    `)
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: activeRegister, error: registerError } = await supabase
    .from("registers")
    .select("id, items_sold, coupons_used, treat_items_sold, total_amount")
    .is("closed_at", null)
    .maybeSingle()

  if (registerError && registerError.code !== 'PGRST116') {
    console.error("Error fetching active register:", registerError.code, registerError.message || 'Unknown error')
  }

  const sellerIds = salesData?.map(sale => sale.created_by) || []
  const { data: sellers } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', sellerIds)

  const recentSales = salesData?.map(sale => ({
    id: sale.id,
    created_at: sale.created_at,
    total_amount: sale.total_amount,
    coupon_applied: sale.coupon_applied,
    coupons_used: sale.coupons_used,
    coupons_count: sale.coupons_used,
    is_treat: false,
    profile: {
      name: sellers?.find(seller => seller.id === sale.created_by)?.name || 'Unknown'
    },
    sale_items: sale.sale_items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price_at_sale: item.price_at_sale,
      products: item.product,
      is_treat: false,
      last_edited_by: null,
      last_edited_at: null,
      is_deleted: false,
      deleted_by: null,
      deleted_at: null
    }))
  }))

  return (
    <div className="flex min-h-screen flex-col space-y-8 p-8">
      <div className="flex items-center justify-between bg-card rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back, {profile.name}</h2>
            <p className="text-muted-foreground">Manage sales and register operations</p>
          </div>
        </div>
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
          <SignOutButton />
        </div>
      </div>

      <RecentSales 
        sales={recentSales || []} 
        showEditStatus={true}
        userId={user.id}
      />
    </div>
  )
}