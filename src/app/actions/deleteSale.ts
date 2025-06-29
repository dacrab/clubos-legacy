"use server";

import { Database } from '@/types/supabase';
import { cookies } from 'next/headers';
import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { revalidatePath } from 'next/cache';
import { API_ERROR_MESSAGES } from '@/lib/constants';
import { ActionResponse, handleActionError, actionSuccess } from '@/lib/action-utils';

export async function deleteSale(saleId: string): Promise<ActionResponse> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { error } = await supabase.from('sales').delete().eq('id', saleId);

    if (error) {
      return await handleActionError(error, API_ERROR_MESSAGES.DELETE_ERROR);
    }

    revalidatePath('/dashboard/history');
    return actionSuccess('Sale deleted successfully');

  } catch (error) {
    return await handleActionError(error, API_ERROR_MESSAGES.DELETE_ERROR);
  }
}