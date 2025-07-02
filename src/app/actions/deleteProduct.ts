"use server"

import { revalidatePath } from 'next/cache'
import { createServerSupabase } from '@/lib/supabase/server'
import { PRODUCT_MESSAGES } from '@/lib/constants'
import { ActionResponse, handleActionError, actionSuccess } from '@/lib/action-utils'

export async function deleteProduct(productId: string): Promise<ActionResponse> {
  try {
    const supabase = await createServerSupabase()

    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('id')
      .eq('product_id', productId)
      .limit(1)

    if (salesError) {
      return handleActionError(salesError, PRODUCT_MESSAGES.ERROR_CHECKING_SALES)
    }

    if (sales && sales.length > 0) {
      return { success: false, message: PRODUCT_MESSAGES.PRODUCT_IN_USE_ERROR }
    }

    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (deleteError) {
      return handleActionError(deleteError, PRODUCT_MESSAGES.ERROR_DELETING_PRODUCT)
    }

    revalidatePath('/dashboard/products')
    return actionSuccess(PRODUCT_MESSAGES.DELETE_SUCCESS)
  } catch (error) {
    return handleActionError(error, PRODUCT_MESSAGES.GENERIC_ERROR)
  }
} 