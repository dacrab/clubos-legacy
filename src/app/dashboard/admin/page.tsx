'use client'

import { createClient } from "@/lib/supabase/client"
import { RecentSales } from "@/components/dashboard/RecentSales"
import { LowStockProducts } from "@/components/dashboard/LowStockProducts"
import { NewSaleDialog } from "@/components/sales/NewSaleDialog"
import { CloseRegisterDialog } from "@/components/registers/CloseRegisterDialog"
import { redirect } from "next/navigation"
import { useRef, useEffect, useState } from "react"
import { 
  TypedSupabaseClient, 
  Profile, 
  Register, 
  Sale, 
  SaleItem,
  DashboardState,
  RawSale,
  RawSaleItem,
  RecentSalesRef,
} from "@/types/app"

const transformSaleItems = (items: RawSaleItem[]): SaleItem[] => (
  items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    price_at_sale: item.price_at_sale,
    product: {
      id: item.product?.id || item.id,
      name: item.product?.name || 'Product Deleted',
      price: item.product?.price || item.price_at_sale,
      is_deleted: item.product?.is_deleted || true
    },
    products: {
      id: item.product?.id || item.id,
      name: item.product?.name || 'Product Deleted',
      price: item.product?.price || item.price_at_sale,
      is_deleted: item.product?.is_deleted || true
    },
    is_treat: item.is_treat,
    last_edited_by: item.last_edited_by || null,
    last_edited_at: item.last_edited_at || null,
    is_deleted: item.is_deleted || false,
    deleted_by: item.deleted_by || null,
    deleted_at: item.deleted_at || null,
    created_at: item.created_at
  }))
)

const transformSales = (salesData: RawSale[]): Sale[] => (
  salesData.map((sale) => ({
    id: sale.id,
    created_at: sale.created_at,
    total_amount: sale.total_amount,
    coupon_applied: sale.coupon_applied,
    coupons_used: sale.coupons_used || 0,
    profile: {
      id: sale.profiles[0]?.id || '',
      name: sale.profiles[0]?.name || '',
      email: sale.profiles[0]?.email || ''
    },
    register: {
      id: sale.registers[0]?.id || '',
      coupons_used: sale.registers[0]?.coupons_used || 0,
      opened_at: sale.registers[0]?.opened_at || '',
      closed_at: sale.registers[0]?.closed_at || null,
      closed_by_name: sale.registers[0]?.closed_by_name || null
    },
    sale_items: transformSaleItems(sale.sale_items)
  }))
)

const AdminDashboardPage = () => {
  const recentSalesRef = useRef<RecentSalesRef>({
    clearSales: () => {},
    refresh: () => {}
  })
  const [state, setState] = useState<DashboardState>({
    user: null,
    profile: null,
    recentSales: [],
    activeRegister: null,
    isLoading: true
  })

  const fetchSalesData = async (supabase: TypedSupabaseClient) => {
    const { data: salesData, error: salesError } = await supabase
      .from("sales")
      .select(`
        id,
        created_at,
        total_amount,
        coupon_applied,
        coupons_used,
        registers!inner(
          id,
          coupons_used,
          opened_at,
          closed_at,
          closed_by_name
        ),
        sale_items!inner(
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
          product:products(
            id,
            name,
            price,
            is_deleted
          )
        ),
        profiles!inner(
          id,
          name,
          email
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5)

    if (salesError) {
      console.error("Error fetching sales:", salesError.message)
      return
    }

    if (!salesData) {
      setState((prev) => ({ ...prev, recentSales: [] }))
      return
    }

    const transformedSales = transformSales(salesData as unknown as RawSale[])
    setState((prev) => ({ ...prev, recentSales: transformedSales }))
  }

  useEffect(() => {
    const setupSubscriptions = (supabase: TypedSupabaseClient) => {
      const handleRegisterChange = () => {
        recentSalesRef.current?.clearSales()
        setState((prev) => ({ ...prev, activeRegister: null }))
      }

      const channels = [
        supabase
          .channel('register-changes')
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'registers', filter: 'closed_at.is.not.null' },
            handleRegisterChange
          )
          .subscribe(),

        supabase
          .channel('sales-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'sales' },
            () => fetchSalesData(supabase)
          )
          .subscribe(),

        supabase
          .channel('sale-items-changes')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'sale_items' },
            () => fetchSalesData(supabase)
          )
          .subscribe()
      ]

      return () => channels.forEach((channel) => supabase.removeChannel(channel))
    }

    const initializeDashboard = async () => {
      try {
        const supabase = createClient()

        const { data: { user: userData }, error: authError } = await supabase.auth.getUser()
        if (!userData || authError) {
          redirect("/auth/sign-in")
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, role, name")
          .eq("id", userData.id)
          .single()

        if (!profileData || profileError || profileData.role !== "admin") {
          redirect("/auth/sign-in")
          return
        }

        const { data: registerData, error: registerError } = await supabase
          .from("registers")
          .select("id, items_sold, coupons_used, treat_items_sold, total_amount, closed_at")
          .is("closed_at", null)
          .maybeSingle()

        if (registerError && registerError.code !== 'PGRST116') {
          console.error("Error fetching active register:", registerError)
        }

        setState((prev) => ({
          ...prev,
          user: userData,
          profile: profileData as Profile,
          activeRegister: registerData as Register | null,
          isLoading: false
        }))

        await fetchSalesData(supabase)

      } catch (error) {
        console.error("Error loading dashboard:", error)
        setState((prev) => ({ ...prev, isLoading: false }))
      }
    }

    const supabase = createClient()
    const cleanup = setupSubscriptions(supabase)
    initializeDashboard()

    return () => {
      cleanup()
    }
  }, [])

  if (state.isLoading || !state.profile) {
    return <div className="flex-1 p-8">Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <div className="flex items-center space-x-2">
          <NewSaleDialog />
          {state.activeRegister && (
            <CloseRegisterDialog
              activeRegisterId={state.activeRegister.id}
              totalAmount={state.activeRegister.total_amount}
              itemsSold={state.activeRegister.items_sold}
              couponsUsed={state.activeRegister.coupons_used}
              treatsCount={state.activeRegister.treat_items_sold}
              onRegisterClosed={() => recentSalesRef.current?.clearSales()}
            />
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <RecentSales 
            ref={recentSalesRef}
            sales={state.recentSales} 
            userId={state.user?.id || ''}
          />
          <LowStockProducts />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage