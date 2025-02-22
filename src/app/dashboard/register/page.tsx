import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { RegistersTable } from "@/components/registers/RegistersTable"

export default async function RegisterPage() {
  const supabase = await createClient()

  const { data: registersData } = await supabase
    .from("registers")
    .select(`
      id,
      user_id:closed_by,
      opened_at,
      closed_at,
      closed_by,
      closed_by_name,
      items_sold,
      coupons_used,
      treat_items_sold,
      total_amount,
      created_at,
      updated_at,
      sales(
        id,
        total_amount,
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
          products:products(
            name
          )
        )
      )
    `)
    .order("closed_at", { ascending: false })

  // Transform the data to match the Register type
  const registers = registersData?.map(register => ({
    id: register.id,
    opened_at: register.opened_at,
    closed_at: register.closed_at,
    items_sold: register.items_sold,
    coupons_used: register.coupons_used,
    treat_items_sold: register.treat_items_sold,
    total_amount: register.total_amount,
    closed_by: register.closed_by,
    created_at: register.created_at,
    updated_at: register.updated_at,
    closed_by_name: register.closed_by_name,
    sales: register.sales?.map(sale => ({
      id: sale.id,
      total_amount: sale.total_amount,
      created_at: register.created_at,
      coupon_applied: false,
      coupons_used: 0,
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
      sale_items: sale.sale_items?.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price_at_sale: item.price_at_sale,
        is_treat: item.is_treat,
        created_at: register.created_at,
        last_edited_by: item.last_edited_by,
        last_edited_at: item.last_edited_at,
        is_deleted: item.is_deleted,
        deleted_by: item.deleted_by,
        deleted_at: item.deleted_at,
        products: {
          id: '',
          name: item.products[0]?.name ?? '',
          price: 0,
          is_deleted: false
        }
      }))
    })) ?? []
  })) ?? []

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