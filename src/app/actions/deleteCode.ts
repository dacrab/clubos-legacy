'use server'

import { revalidatePath } from 'next/cache'
import { CODE_MESSAGES } from '@/lib/constants'
import { 
  ActionResponse, 
  getActionSupabase, 
  actionSuccess, 
  handleActionError 
} from '@/lib/action-utils'

export async function deleteCode(codeId: string): Promise<ActionResponse> {
  try {
    const supabase = await getActionSupabase()

    // First check if the code exists
    const { data: existingCode, error: fetchError } = await supabase
      .from('codes')
      .select('id')
      .eq('id', codeId)
      .single()

    if (fetchError || !existingCode) {
      throw new Error('Code not found')
    }

    // Mark related sales as deleted instead of deleting them
    const { error: salesUpdateError } = await supabase
      .from('sales')
      .update({ is_deleted: true })
      .eq('code_id', codeId)

    if (salesUpdateError) {
      console.error('Error updating sales:', salesUpdateError)
      throw new Error(salesUpdateError.message)
    }

    // Then delete the code
    const { error: deleteError } = await supabase
      .from('codes')
      .delete()
      .eq('id', codeId)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      throw new Error(deleteError.message)
    }

    revalidatePath('/dashboard/codes')
    return actionSuccess(CODE_MESSAGES.DELETE_SUCCESS)
  } catch (error) {
    return handleActionError(error, CODE_MESSAGES.GENERIC_ERROR)
  }
}