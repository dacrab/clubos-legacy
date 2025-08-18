'use server';

import { revalidatePath } from 'next/cache';

import { actionSuccess, handleActionError, type ActionResponse } from '@/lib/action-utils';
import { PRODUCT_MESSAGES } from '@/lib/constants';
import { checkProductHasSales } from '@/lib/db/services/products';

export async function deleteProduct(productId: string): Promise<ActionResponse> {
  try {
    // Check for sales using this product before deleting
    const hasSales = await checkProductHasSales(productId);
    if (hasSales) {
      throw new Error('Δεν μπορεί να διαγραφεί το προϊόν διότι έχει σχετικές πωλήσεις.');
    }

    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete product');
    }

    revalidatePath('/dashboard/products');
    return actionSuccess(PRODUCT_MESSAGES.DELETE_SUCCESS);
  } catch (error) {
    return handleActionError(error);
  }
}
