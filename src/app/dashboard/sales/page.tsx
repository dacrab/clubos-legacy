import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { SalesTable } from "@/components/sales/SalesTable"
import { 
  Sale, 
  SaleItem, 
  RawSaleItem, 
  RawSaleResponse 
} from "@/types/app"

// Helper functions for data transformation
const transformSaleItem = (item: RawSaleItem): SaleItem => ({
  id: item.id,
  quantity: item.quantity,
  price_at_sale: item.price_at_sale,
  is_treat: item.is_treat,
  created_at: item.created_at,
  last_edited_by: item.last_edited_by || null,
  last_edited_at: item.last_edited_at || null,
  is_deleted: item.is_deleted || false,
  deleted_by: item.deleted_by || null,
  deleted_at: item.deleted_at || null,
  product: {
    id: item.product?.id || '',
    name: item.product?.name || 'Product Deleted',
    price: item.product?.price || 0,
    is_deleted: item.product?.is_deleted || false
  },
  products: {
    id: item.product?.id || '',
    name: item.product?.name || 'Product Deleted',
    price: item.product?.price || 0,
    is_deleted: item.product?.is_deleted || false
  }
})

const transformSale = (sale: RawSaleResponse): Sale => ({
  id: sale.id,
  created_at: sale.created_at,
  total_amount: sale.total_amount,
  coupon_applied: sale.coupon_applied,
  coupons_used: sale.coupons_used,
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
  sale_items: sale.sale_items.map(transformSaleItem)
})

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
        product:products(
          id,
          name,
          price,
          is_deleted
        )
      )
    `)
    .order("created_at", { ascending: false })

  const sales = (rawSales as unknown as RawSaleResponse[]).map(transformSale)

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