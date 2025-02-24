'use client'

import { User } from '@supabase/supabase-js'
import { createClient } from "@/lib/supabase/client"
import { RecentSales } from "@/components/dashboard/RecentSales"
import type { RecentSalesRef, RawProfile } from "@/types/sales"
import { NewSaleDialog } from "@/components/sales/NewSaleDialog"
import { CloseRegisterDialog } from "@/components/registers/CloseRegisterDialog"
import { redirect } from "next/navigation"
import { SignOutButton } from "@/components/SignOutButton"
import { useRef, useEffect, useState } from "react"
import { TypedSupabaseClient, Profile, Register, Sale } from "@/types/app"
import { transformSales } from "@/types/sales"

export default function StaffDashboardPage() {
  // Refs
  const recentSalesRef = useRef<RecentSalesRef>(null)

  // State
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [activeRegister, setActiveRegister] = useState<Register | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Data fetching
  const fetchSalesData = async (supabase: TypedSupabaseClient) => {
    const { data: salesData, error: salesError } = await supabase
      .from("sales")
      .select(`
        id,
        created_at,
        total_amount,
        coupon_applied,
        coupons_used,
        registers!inner(id, coupons_used, opened_at, closed_at, closed_by_name),
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
        profiles!inner(id, name, email)
      `)
      .order("created_at", { ascending: false })
      .limit(5)

    if (salesError) {
      console.error("Error fetching sales:", salesError.message)
      return
    }

    if (salesData) {
      // Transform the data to match our expected types
      const typedSalesData = salesData.map(sale => {
        const transformedSaleItems = sale.sale_items.map(item => {
          const productData = Array.isArray(item.product) ? item.product[0] : item.product
          return {
            ...item,
            product: productData ? {
              id: productData.id,
              name: productData.name,
              price: productData.price,
              is_deleted: productData.is_deleted
            } : null
          }
        })

        const transformedProfiles = sale.profiles.map((profile): RawProfile => ({
          id: profile.id || '',
          name: profile.name || '',
          email: profile.email || '',
          role: 'staff'
        }))

        const transformedRegisters = sale.registers.map(register => ({
          id: register.id,
          coupons_used: register.coupons_used,
          opened_at: register.opened_at,
          closed_at: register.closed_at,
          closed_by_name: register.closed_by_name
        }))

        return {
          id: sale.id,
          created_at: sale.created_at,
          total_amount: sale.total_amount,
          coupon_applied: sale.coupon_applied,
          coupons_used: sale.coupons_used,
          sale_items: transformedSaleItems,
          profiles: transformedProfiles,
          registers: transformedRegisters
        }
      })

      const transformedSales = transformSales(typedSalesData)
      setRecentSales(transformedSales)
    }
  }

  // Event handlers
  const handleRegisterClose = () => {
    recentSalesRef.current?.clearSales()
    setActiveRegister(null)
  }

  // Initial data load
  useEffect(() => {
    const setupSubscriptions = (supabase: TypedSupabaseClient) => {
      const registerChannel = supabase
        .channel('register-changes')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'registers', filter: 'closed_at.is.not.null' },
          handleRegisterClose
        )
        .subscribe()

      const salesChannel = supabase
        .channel('sales-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sales' },
          () => fetchSalesData(supabase)
        )
        .subscribe()

      const saleItemsChannel = supabase
        .channel('sale-items-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sale_items' },
          () => fetchSalesData(supabase)
        )
        .subscribe()

      return () => {
        supabase.removeChannel(registerChannel)
        supabase.removeChannel(salesChannel)
        supabase.removeChannel(saleItemsChannel)
      }
    }

    const fetchData = async () => {
      try {
        const supabase = createClient()

        // Get user
        const { data: { user: userData }, error: authError } = await supabase.auth.getUser()
        if (!userData || authError) {
          return redirect("/auth/sign-in")
        }
        setUser(userData)

        // Get profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, role, name")
          .eq("id", userData.id)
          .single()

        if (!profileData || profileError || !["admin", "staff"].includes(profileData.role)) {
          return redirect("/auth/sign-in")
        }
        setProfile(profileData as Profile)

        // Get active register
        const { data: registerData, error: registerError } = await supabase
          .from("registers")
          .select("id, items_sold, coupons_used, treat_items_sold, total_amount, closed_at")
          .is("closed_at", null)
          .maybeSingle()

        if (registerError && registerError.code !== 'PGRST116') {
          console.error("Error fetching active register:", registerError.code, registerError.message || 'Unknown error')
        }

        setActiveRegister(registerData as Register | null)
        await fetchSalesData(supabase)

      } catch (error) {
        console.error("Error loading dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const cleanup = setupSubscriptions(createClient())
    return () => {
      cleanup()
    }
  }, [])

  if (isLoading || !profile) {
    return <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Staff Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile.name}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="flex gap-4 items-center">
        <NewSaleDialog />
        {activeRegister && (
          <CloseRegisterDialog
            activeRegisterId={activeRegister.id}
            totalAmount={activeRegister.total_amount}
            itemsSold={activeRegister.items_sold}
            couponsUsed={activeRegister.coupons_used}
            treatsCount={activeRegister.treat_items_sold}
            onRegisterClosed={handleRegisterClose}
          />
        )}
      </div>

      <div className="grid gap-4">
        <RecentSales 
          ref={recentSalesRef} 
          sales={recentSales}
          userId={user?.id || ''}
        />
      </div>
    </div>
  )
}