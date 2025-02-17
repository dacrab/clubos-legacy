'use client'

import { createClient } from "@/lib/supabase/client"
import { RecentSales } from "@/components/dashboard/RecentSales"
import { NewSaleDialog } from "@/components/sales/NewSaleDialog"
import { CloseRegisterDialog } from "@/components/registers/CloseRegisterDialog"
import { redirect } from "next/navigation"
import { SignOutButton } from "@/components/SignOutButton"
import { useRef, useEffect, useState } from "react"

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
  last_edited_by: string | null
  last_edited_at: string | null
  is_deleted: boolean
  deleted_by: string | null
  deleted_at: string | null
  created_at: string
}

interface Sale {
  id: string
  created_at: string
  total_amount: number
  coupon_applied: boolean
  coupons_used: number
  profile: {
    name: string
  }
  sale_items: SaleItem[]
}

export default function StaffDashboardPage() {
  const recentSalesRef = useRef<{ clearSales: () => void } | null>(null)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [activeRegister, setActiveRegister] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSalesData = async (supabase: any) => {
    const { data: salesData, error: salesError } = await supabase
      .from("sales")
      .select(`
        id,
        created_at,
        total_amount,
        created_by,
        coupon_applied,
        registers!inner(
          coupons_used
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
          products!inner(
            id,
            name,
            is_deleted
          )
        ),
        profiles!inner(
          name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5)

    if (salesError) {
      console.error("Error fetching sales:", salesError.message)
      return
    }

    // Transform sales data
    const transformedSales: Sale[] = salesData?.map(sale => ({
      id: sale.id,
      created_at: sale.created_at,
      total_amount: sale.total_amount,
      coupon_applied: sale.coupon_applied,
      coupons_used: sale.registers?.coupons_used || 0,
      profile: {
        name: sale.profiles.name
      },
      sale_items: sale.sale_items.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price_at_sale: item.price_at_sale,
        products: item.products,
        is_treat: item.is_treat,
        last_edited_by: item.last_edited_by,
        last_edited_at: item.last_edited_at,
        is_deleted: item.is_deleted,
        deleted_by: item.deleted_by,
        deleted_at: item.deleted_at,
        created_at: item.created_at
      }))
    })) || []

    setRecentSales(transformedSales)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()

        // Get user
        const { data: { user: userData }, error: authError } = await supabase.auth.getUser()
        if (!userData || authError) {
          redirect("/auth/sign-in")
          return
        }
        setUser(userData)

        // Get profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role, name")
          .eq("id", userData.id)
          .single()

        if (!profileData || profileError || !["admin", "staff"].includes(profileData.role)) {
          redirect("/auth/sign-in")
          return
        }
        setProfile(profileData)

        // Get active register
        const { data: registerData, error: registerError } = await supabase
          .from("registers")
          .select("id, items_sold, coupons_used, treat_items_sold, total_amount")
          .is("closed_at", null)
          .maybeSingle()

        if (registerError && registerError.code !== 'PGRST116') {
          console.error("Error fetching active register:", registerError.code, registerError.message || 'Unknown error')
        }

        setActiveRegister(registerData)

        // Fetch initial sales data
        await fetchSalesData(supabase)

      } catch (error) {
        console.error("Error loading dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Set up real-time subscriptions
    const supabase = createClient()
    
    // Register changes subscription
    const registerChannel = supabase
      .channel('register-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'registers',
          filter: 'closed_at.is.not.null'
        },
        () => {
          // Clear sales when any register is closed
          recentSalesRef.current?.clearSales()
          setActiveRegister(null)
        }
      )
      .subscribe()

    // Sales changes subscription
    const salesChannel = supabase
      .channel('sales-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'sales'
        },
        () => {
          // Refresh sales data when any change occurs
          fetchSalesData(supabase)
        }
      )
      .subscribe()

    // Sale items changes subscription
    const saleItemsChannel = supabase
      .channel('sale-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'sale_items'
        },
        () => {
          // Refresh sales data when any change occurs
          fetchSalesData(supabase)
        }
      )
      .subscribe()

    fetchData()

    return () => {
      supabase.removeChannel(registerChannel)
      supabase.removeChannel(salesChannel)
      supabase.removeChannel(saleItemsChannel)
    }
  }, [])

  if (isLoading || !profile) {
    return <div className="flex min-h-screen flex-col space-y-8 p-8">Loading...</div>
  }

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
              onRegisterClosed={() => recentSalesRef.current?.clearSales()}
            />
          )}
          <SignOutButton />
        </div>
      </div>

      <RecentSales 
        ref={recentSalesRef}
        sales={recentSales} 
        userId={user?.id}
      />
    </div>
  )
}