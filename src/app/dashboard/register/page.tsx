import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { RegistersTable } from "@/components/registers/RegistersTable"
import { Register,SaleItemProduct } from "@/types/app"

interface RawSaleItem {
  id: string
  quantity: number
  price_at_sale: number
  is_treat: boolean
  last_edited_by: string | null
  last_edited_at: string | null
  is_deleted: boolean
  deleted_by: string | null
  deleted_at: string | null
  product_id: string
  product: {
    id: string
    name: string
    price: number
    is_deleted: boolean
  } | null
}

interface RawSale {
  id: string
  total_amount: number
  created_at: string
  sale_items: RawSaleItem[]
}

interface RawRegister {
  id: string
  opened_at: string
  closed_at: string | null
  items_sold: number
  coupons_used: number
  treat_items_sold: number
  total_amount: number
  closed_by: string | null
  created_at: string
  updated_at: string
  closed_by_name: string | null
  sales: RawSale[]
}

export default async function RegisterPage() {
  const supabase = await createClient()

  const { data: registersData } = await supabase
    .from("registers")
    .select(`
      id,
      opened_at,
      closed_at,
      items_sold,
      coupons_used,
      treat_items_sold,
      total_amount,
      created_at,
      updated_at,
      closed_by,
      closed_by_name,
      sales(
        id,
        total_amount,
        created_at,
        sale_items(
          id,
          quantity,
          price_at_sale,
          is_treat,
          last_edited_by,
          last_edited_at,
          is_deleted,
          deleted_by,
          deleted_at,
          product_id,
          product:products(
            id,
            name,
            price,
            is_deleted
          )
        )
      )
    `)
    .order("closed_at", { ascending: false })

  const registers: Register[] = (registersData as unknown as RawRegister[])?.map(register => ({
    id: register.id,
    created_at: register.created_at,
    updated_at: register.updated_at,
    opened_at: register.opened_at,
    closed_at: register.closed_at,
    items_sold: register.items_sold,
    coupons_used: register.coupons_used,
    treat_items_sold: register.treat_items_sold,
    total_amount: register.total_amount,
    profiles: register.closed_by ? {
      id: register.closed_by,
      name: register.closed_by_name || '',
      email: ''
    } : undefined,
    sales: (register.sales || []).map(sale => ({
      id: sale.id,
      created_at: sale.created_at,
      updated_at: sale.created_at,
      total_amount: sale.total_amount,
      register_id: register.id,
      coupon_applied: false,
      coupons_used: 0,
      created_by: register.closed_by || '',
      profile: {
        id: register.closed_by || '',
        name: register.closed_by_name || '',
        email: ''
      },
      register: {
        id: register.id,
        coupons_used: register.coupons_used,
        opened_at: register.opened_at,
        closed_at: register.closed_at,
        closed_by_name: register.closed_by_name
      },
      sale_items: (sale.sale_items || []).map(item => {
        const product: SaleItemProduct = {
          id: item.product?.id || '',
          name: item.product?.name || 'Unknown Product',
          price: item.product?.price || item.price_at_sale,
          is_deleted: item.product?.is_deleted || true
        }
        
        return {
          id: item.id,
          sale_id: sale.id,
          created_at: sale.created_at,
          quantity: item.quantity,
          price_at_sale: item.price_at_sale,
          product_id: item.product_id,
          is_treat: item.is_treat,
          last_edited_by: item.last_edited_by,
          last_edited_at: item.last_edited_at,
          is_deleted: item.is_deleted,
          deleted_by: item.deleted_by,
          deleted_at: item.deleted_at,
          product: product,
          products: product
        }
      })
    }))
  })) || []

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Registers" 
        description="View all closed registers"
      />
      <RegistersTable registers={registers} />
    </DashboardShell>
  )
}