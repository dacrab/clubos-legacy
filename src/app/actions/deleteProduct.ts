'use server'

import { revalidatePath } from 'next/cache'
import { CODE_MESSAGES as PRODUCT_MESSAGES } from '@/lib/constants'
import { 
  ActionResponse, 
  getActionSupabase, 
  actionSuccess, 
  handleActionError 
} from '@/lib/action-utils'

export async function deleteProduct(productId: string): Promise<ActionResponse> {
  try {
    const supabase = await getActionSupabase()

    const { data: existingProduct, error: fetchError } = await supabase
      .from('codes')
      .select('id')
      .eq('id', productId)
      .single()

    if (fetchError || !existingProduct) {
      throw new Error('Product not found')
    }

    const { error: salesUpdateError } = await supabase
      .from('sales')
      .update({ is_deleted: true })
      .eq('code_id', productId)

    if (salesUpdateError) {
      console.error('Error updating sales:', salesUpdateError)
      throw new Error(salesUpdateError.message)
    }

    const { error: deleteError } = await supabase
      .from('codes')
      .delete()
      .eq('id', productId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      throw new Error(deleteError.message)
    }

    revalidatePath('/dashboard/products')
    return actionSuccess(PRODUCT_MESSAGES.DELETE_SUCCESS)
  } catch (error) {
    return handleActionError(error, PRODUCT_MESSAGES.GENERIC_ERROR)
  }
} 