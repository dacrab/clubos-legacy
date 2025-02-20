'use client'

import { User } from '@supabase/supabase-js'
import { createClient } from "@/lib/supabase/client"
import { RecentSales, RecentSalesRef } from "@/components/dashboard/RecentSales"
import { NewSaleDialog } from "@/components/sales/NewSaleDialog"
import { CloseRegisterDialog } from "@/components/registers/CloseRegisterDialog"
import { redirect } from "next/navigation"
import { SignOutButton } from "@/components/SignOutButton"
import { useRef, useEffect, useState } from "react"
import { TypedSupabaseClient, Profile, Register, Sale, SaleItem } from "@/types/app"

// Types
interface RawSaleItem {
  id: string
  quantity: number
  price_at_sale: number
  is_treat: boolean
  created_at: string
  last_edited_by: string | null
  last_edited_at: string | null
  is_deleted: boolean
  deleted_by: string | null
  deleted_at: string | null
  product: {
    id: string
    name: string
    price: number
    is_deleted: boolean
  }
}

interface RawSale {
  id: string
  created_at: string
  total_amount: number
  coupon_applied: boolean
  coupons_used: number
  profiles: { 
    id: string
    name: string
    email: string 
  }[]
  sale_items: RawSaleItem[]
  registers: { 
    id: string
    coupons_used: number
    opened_at: string
    closed_at: string | null
    closed_by_name: string | null 
  }[]
}

// Helper functions
const transformSaleItems = (items: RawSaleItem[]): SaleItem[] => {
  return items.map((item): SaleItem => ({
    id: item.id,
    quantity: item.quantity,
    price_at_sale: item.price_at_sale,
    products: item.product,
    is_treat: item.is_treat,
    last_edited_by: item.last_edited_by,
    last_edited_at: item.last_edited_at,
    is_deleted: item.is_deleted || false,
    deleted_by: item.deleted_by,
    deleted_at: item.deleted_at,
    created_at: item.created_at
  }))
}

const transformSales = (salesData: RawSale[]): Sale[] => {
  return salesData.map((sale): Sale => ({
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
}

export default function StaffDashboardPage() {
  const recentSalesRef = useRef<RecentSalesRef>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentSales, setRecentSales] = useState<Sale[]>([])
  const [activeRegister, setActiveRegister] = useState<Register | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

    setRecentSales(salesData ? transformSales(salesData.map((sale: any): RawSale => ({
      id: sale.id,
      created_at: sale.created_at,
      total_amount: sale.total_amount,
      coupon_applied: sale.coupon_applied,
      coupons_used: sale.coupons_used,
      profiles: sale.profiles.map((profile: any) => ({
        id: profile.id,
        name: profile.name,
        email: profile.email
      })),
      registers: sale.registers.map((register: any) => ({
        id: register.id,
        coupons_used: register.coupons_used,
        opened_at: register.opened_at,
        closed_at: register.closed_at,
        closed_by_name: register.closed_by_name
      })),
      sale_items: sale.sale_items.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        price_at_sale: item.price_at_sale,
        is_treat: item.is_treat,
        created_at: item.created_at,
        last_edited_by: item.last_edited_by,
        last_edited_at: item.last_edited_at,
        is_deleted: item.is_deleted,
        deleted_by: item.deleted_by,
        deleted_at: item.deleted_at,
        product: {
          id: item.product?.[0]?.id || '',
          name: item.product?.[0]?.name || '',
          price: item.product?.[0]?.price || 0,
          is_deleted: item.product?.[0]?.is_deleted || false
        }
      }))
    }))) : [])
  }

  const handleRegisterClose = () => {
    recentSalesRef.current?.clearSales()
    setActiveRegister(null)
  }

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

  useEffect(() => {
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
    return cleanup
  }, [])

  if (isLoading || !profile) {
    return <div className="flex min-h-screen flex-col space-y-8 p-8">Loading...</div>
  }

  return (
    <div className="flex min-h-screen flex-col space-y-8 p-8">
      <div className="flex items-center justify-between bg-card rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Staff Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {profile.name}</p>
          </div>
        </div>
        <SignOutButton />
      </div>

      <div className="grid gap-4">
        <RecentSales 
          ref={recentSalesRef} 
          sales={recentSales}
          userId={user?.id || ''}
        />
      </div>

      <div className="flex gap-4">
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
    </div>
  )
}