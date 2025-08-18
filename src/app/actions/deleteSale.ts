'use server';

import { revalidatePath } from 'next/cache';

import { actionSuccess, handleActionError, type ActionResponse } from '@/lib/action-utils';
import { stackServerApp } from '@/lib/auth';

export async function deleteSale(saleId: string): Promise<ActionResponse> {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/sales/${saleId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete sale');
    }

    revalidatePath('/dashboard/history');
    return actionSuccess('Sale deleted successfully');
  } catch (error) {
    return handleActionError(error);
  }
}
