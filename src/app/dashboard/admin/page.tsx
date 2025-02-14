import { createClient } from "@/lib/supabase/server"
import { RecentSales } from "@/components/dashboard/RecentSales"
import { LowStockProducts } from "@/components/dashboard/LowStockProducts"
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
  products: Product
  is_treat: boolean
  marked_as_treat_by?: string | null
  marked_as_treat_at?: string | null
  last_edited_by?: string | null
  last_edited_at?: string | null
  is_deleted?: boolean
  deleted_by?: string | null
  deleted_at?: string | null
  created_at: string
}

interface Sale {
  id: string
  created_at: string
  profile: {
    name: string
  }
  sale_items: SaleItem[]
  total_amount: number
  coupon_applied: boolean
  coupons_used: number
  coupons_count: number
}

// Supabase response types
interface SupabaseSaleItem {
  id: string
  quantity: number
  price_at_sale: number
  products: Product
  is_treat: boolean
  last_edited_by: string | null
  last_edited_at: string | null
  is_deleted: boolean
  deleted_by: string | null
  deleted_at: string | null
  created_at: string
}

interface SupabaseSale {
  id: string
  created_at: string
  total_amount: number
  created_by: string
  coupon_applied: boolean
  register_id: string
  registers: {
    coupons_used: number
  }
  sale_items: SupabaseSaleItem[]
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError) redirect("/auth/sign-in")

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", user.id)
    .single()

  if (!profile || profileError || profile.role !== "admin") {
    redirect("/auth/sign-in")
  }

  const [salesResponse, registerResponse] = await Promise.all([
    supabase
      .from("sales")
      .select(`
        id,
        created_at,
        total_amount,
        created_by,
        coupon_applied,
        register_id,
        registers!inner(
          coupons_used
        ),
        sale_items(
          id,
          quantity,
          price_at_sale,
          is_treat,
          created_at,
          last_edited_by,
          last_edited_at,
          is_deleted,
          deleted_by,
          deleted_at,
          products:product_id(
            id,
            name,
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
      .maybeSingle()
  ])

  const { data: salesData, error: salesError } = salesResponse as { data: SupabaseSale[] | null, error: any }
  const { data: activeRegister, error: registerError } = registerResponse

  if (salesError) {
    console.error("Error fetching sales:", salesError.message)
  }

  if (registerError && registerError.code !== 'PGRST116') {
    console.error("Error fetching active register:", registerError.code, registerError.message || 'Unknown error')
  }

  const sellerIds = salesData?.map(sale => sale.created_by) || []
  const { data: sellers } = await supabase
    .from('profiles')
    .select('id, name')
    .in('id', sellerIds)

  const recentSales: Sale[] = salesData?.map(sale => ({
    id: sale.id,
    created_at: sale.created_at,
    total_amount: sale.total_amount,
    coupon_applied: sale.coupon_applied,
    coupons_used: sale.registers?.coupons_used || 0,
    coupons_count: sale.registers?.coupons_used || 0,
    profile: {
      name: sellers?.find(seller => seller.id === sale.created_by)?.name || 'Unknown'
    },
    sale_items: sale.sale_items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price_at_sale: item.price_at_sale,
      products: item.products,
      is_treat: item.is_treat,
      marked_as_treat_by: null,
      marked_as_treat_at: null,
      last_edited_by: item.last_edited_by,
      last_edited_at: item.last_edited_at,
      is_deleted: item.is_deleted,
      deleted_by: item.deleted_by,
      deleted_at: item.deleted_at,
      created_at: item.created_at
    }))
  })) || []

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <div className="flex items-center space-x-2">
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
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <RecentSales 
            sales={recentSales} 
            showEditStatus={true}
            userId={user.id}
          />
          <LowStockProducts />
        </div>
      </div>
    </div>
  )
}