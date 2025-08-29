import { useState } from "react";
import { toast } from "sonner";

import { createClientSupabase } from "@/lib/supabase";
import { type Sale } from "@/types/sales";

interface UseSaleActionsProps {
  onSuccess?: () => void;
}

/**
 * Hook for handling common sale actions (edit, delete)
 */
export function useSaleActions({ onSuccess }: UseSaleActionsProps = {}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const supabase = createClientSupabase() as any;

  /**
   * Delete a sale by marking it as deleted
   */
  const deleteSale = async (saleId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('sales')
        .update({ is_deleted: true })
        .eq('id', saleId);

      if (error) {throw error;}

      toast.success('Η πώληση αφαιρέθηκε επιτυχώς');
      if (onSuccess) {onSuccess();}
      return true;
    } catch (error) {
      console.error('Error deleting sale:', error);
      toast.error('Αποτυχία διαγραφής πώλησης');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Edit a sale with updated information
   */
  const editSale = async (saleId: string, originalSale: Sale, updatedData: Partial<Sale>): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Store original values for reference
      const updateData = {
        ...updatedData,
        is_edited: true,
        original_code: originalSale.code.name,
        original_quantity: originalSale.quantity
      };

      const { error } = await supabase
        .from('sales')
        .update(updateData)
        .eq('id', saleId);

      if (error) {throw error;}

      toast.success('Η πώληση ενημερώθηκε επιτυχώς');
      if (onSuccess) {onSuccess();}
      return true;
    } catch (error) {
      console.error('Error updating sale:', error);
      toast.error('Αποτυχία ενημέρωσης πώλησης');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    deleteSale,
    editSale
  };
} 