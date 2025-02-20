import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { SalesTable } from "@/components/sales/SalesTable"
import { Sale, SaleItem } from "@/types"

type RawSaleItem = {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  price_at_sale: number
  is_treat: boolean
  created_at: string
  last_edited_by: string | undefined
  last_edited_at: string | undefined
  is_deleted: boolean
  deleted_by: string | undefined
  deleted_at: string | undefined
  products: {
    name: string
  }[]
}

type RawSaleResponse = {
  id: string
  register_id: string
  total_amount: number
  coupon_applied: boolean
  coupons_used: number
  created_by: string
  created_at: string
  updated_at: string
  profiles: Array<{ 
    id: string
    name: string 
    email: string 
  }>
  registers: Array<{ 
    id: string
    coupons_used: number
    opened_at: string
    closed_at: string | null
    closed_by_name: string | null
  }>
  sale_items: Array<{
    id: string
    sale_id: string
    product_id: string
    quantity: number
    price_at_sale: number
    is_treat: boolean
    created_at: string
    last_edited_by?: string
    last_edited_at?: string
    is_deleted?: boolean
    deleted_by?: string
    deleted_at?: string
    products: Array<{
      id: string
      name: string
      price: number
      is_deleted: boolean
    }>
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
      coupons_used,
      created_by,
      created_at,
      updated_at,
      profiles!inner(
        id,
        name,
        email
      ),
      registers!inner(
        id,
        coupons_used,
        opened_at,
        closed_at,
        closed_by_name
      ),
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
        products:products(
          id,
          name,
          price,
          is_deleted
        )
      )
    `)
    .order("created_at", { ascending: false })

  // Transform the data to match the Sale type
  const sales = (rawSales ?? []).map((sale: RawSaleResponse) => ({
    id: sale.id,
    register_id: sale.register_id,
    total_amount: sale.total_amount,
    coupon_applied: sale.coupon_applied,
    coupons_used: sale.coupons_used,
    created_by: sale.created_by,
    created_at: sale.created_at,
    updated_at: sale.updated_at,
    profile: {
      id: sale.profiles[0]?.id ?? '',
      name: sale.profiles[0]?.name ?? '',
      email: sale.profiles[0]?.email ?? ''
    },
    register: {
      id: sale.registers[0]?.id ?? '',
      coupons_used: sale.registers[0]?.coupons_used ?? 0,
      opened_at: sale.registers[0]?.opened_at ?? '',
      closed_at: sale.registers[0]?.closed_at ?? null,
      closed_by_name: sale.registers[0]?.closed_by_name ?? null
    },
    sale_items: sale.sale_items.map(item => ({
      id: item.id,
      sale_id: item.sale_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_sale: item.price_at_sale,
      is_treat: item.is_treat,
      created_at: item.created_at,
      last_edited_by: item.last_edited_by,
      last_edited_at: item.last_edited_at,
      is_deleted: item.is_deleted,
      deleted_by: item.deleted_by,
      deleted_at: item.deleted_at,
      products: {
        id: item.products[0]?.id ?? '',
        name: item.products[0]?.name ?? '',
        price: item.products[0]?.price ?? 0,
        is_deleted: item.products[0]?.is_deleted ?? false
      }
    } as SaleItem))
  })) as Sale[]

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