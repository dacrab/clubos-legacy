"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createNewRegister() {
  const supabase = await createClient()
  
  await supabase
    .from("registers")
    .insert({
      opened_at: new Date().toISOString(),
      items_sold: 0,
      coupons_used: 0,
      treat_items_sold: 0,
      total_amount: 0,
    })
    .select()
    .single()
    .throwOnError()

  revalidatePath("/dashboard/staff")
}

interface EditSaleItemParams {
  saleItemId: string
  quantity: number
  productId: string
  userId: string
}

interface DeleteSaleItemParams {
  saleItemId: string
  userId: string
}

export async function editSaleItem({ saleItemId, quantity, productId, userId }: EditSaleItemParams) {
  const supabase = await createClient()

  // First, check if the sale item is within the 5-minute edit window
  const { data: saleItemWithTimestamp, error: saleItemError } = await supabase
    .from('sale_items')
    .select('created_at, sale_id')
    .eq('id', saleItemId)
    .single()

  if (saleItemError) {
    return { error: saleItemError.message }
  }

  const createdAt = new Date(saleItemWithTimestamp.created_at)
  const now = new Date()
  const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)

  if (diffInMinutes > 5) {
    return { error: "Orders can only be edited within 5 minutes of creation" }
  }

  // First, get the product price
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('price')
    .eq('id', productId)
    .single()

  if (productError) {
    return { error: productError.message }
  }

  // Update the sale item with new product and quantity
  const { error } = await supabase
    .from('sale_items')
    .update({
      quantity,
      product_id: productId,
      price_at_sale: product.price,
      last_edited_by: userId,
      last_edited_at: new Date().toISOString()
    })
    .eq('id', saleItemId)

  if (error) {
    return { error: error.message }
  }

  // Update the total amount in the parent sale
  const { data: saleItemParent } = await supabase
    .from('sale_items')
    .select('sale_id')
    .eq('id', saleItemId)
    .single()

  if (saleItemParent) {
    // Get all items for this sale to recalculate total
    const { data: saleItems } = await supabase
      .from('sale_items')
      .select('quantity, price_at_sale')
      .eq('sale_id', saleItemParent.sale_id)
      .eq('is_deleted', false)

    const totalAmount = saleItems?.reduce((sum, item) => sum + (item.quantity * item.price_at_sale), 0) || 0

    // Update sale total
    await supabase
      .from('sales')
      .update({ total_amount: totalAmount })
      .eq('id', saleItemParent.sale_id)
  }

  revalidatePath('/dashboard/staff')
  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function deleteSaleItem({ saleItemId, userId }: DeleteSaleItemParams) {
  const supabase = await createClient()

  // First, check if the sale item is within the 5-minute delete window
  const { data: saleItemWithTimestamp, error: saleItemError } = await supabase
    .from('sale_items')
    .select('created_at')
    .eq('id', saleItemId)
    .single()

  if (saleItemError) {
    return { error: saleItemError.message }
  }

  const createdAt = new Date(saleItemWithTimestamp.created_at)
  const now = new Date()
  const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)

  if (diffInMinutes > 5) {
    return { error: "Orders can only be deleted within 5 minutes of creation" }
  }

  const { error } = await supabase
    .from('sale_items')
    .update({
      is_deleted: true,
      deleted_by: userId,
      deleted_at: new Date().toISOString()
    })
    .eq('id', saleItemId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/staff')
  revalidatePath('/dashboard/admin')
  return { success: true }
} 