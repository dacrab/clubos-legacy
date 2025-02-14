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
  const { data: saleItem, error: saleItemError } = await supabase
    .from('sale_items')
    .select('created_at, sale_id, quantity, product_id')
    .eq('id', saleItemId)
    .single()

  if (saleItemError) {
    return { error: saleItemError.message }
  }

  const createdAt = new Date(saleItem.created_at)
  const now = new Date()
  const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)

  if (diffInMinutes > 5) {
    return { error: "Orders can only be edited within 5 minutes of creation" }
  }

  // Get both old and new product details
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, price, stock')
    .in('id', [saleItem.product_id, productId])

  if (productsError) {
    return { error: productsError.message }
  }

  const oldProduct = products.find(p => p.id === saleItem.product_id)
  const newProduct = products.find(p => p.id === productId)

  if (!oldProduct || !newProduct) {
    return { error: "Products not found" }
  }

  // Start a transaction
  const { error: transactionError } = await supabase.rpc('handle_edit_sale_item', {
    p_sale_item_id: saleItemId,
    p_new_quantity: quantity,
    p_new_product_id: productId,
    p_new_price: newProduct.price,
    p_user_id: userId,
    p_old_product_id: oldProduct.id,
    p_old_quantity: saleItem.quantity
  })

  if (transactionError) {
    return { error: transactionError.message }
  }

  revalidatePath('/dashboard/staff')
  revalidatePath('/dashboard/admin')
  return { success: true }
}

export async function deleteSaleItem({ saleItemId, userId }: DeleteSaleItemParams) {
  const supabase = await createClient()

  // First, check if the sale item is within the 5-minute delete window and get necessary details
  const { data: saleItem, error: saleItemError } = await supabase
    .from('sale_items')
    .select('created_at, product_id, quantity')
    .eq('id', saleItemId)
    .single()

  if (saleItemError) {
    return { error: saleItemError.message }
  }

  const createdAt = new Date(saleItem.created_at)
  const now = new Date()
  const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)

  if (diffInMinutes > 5) {
    return { error: "Orders can only be deleted within 5 minutes of creation" }
  }

  // Start a transaction
  const { error: transactionError } = await supabase.rpc('handle_delete_sale_item', {
    p_sale_item_id: saleItemId,
    p_user_id: userId,
    p_product_id: saleItem.product_id,
    p_quantity: saleItem.quantity
  })

  if (transactionError) {
    return { error: transactionError.message }
  }

  revalidatePath('/dashboard/staff')
  revalidatePath('/dashboard/admin')
  return { success: true }
} 