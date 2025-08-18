import { useState } from 'react';
import { toast } from 'sonner';

export function useSaleActions() {
  const [isLoading, setIsLoading] = useState(false);

  const deleteSale = async (saleId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete sale');
      }

      toast.success('Η πώληση διαγράφηκε επιτυχώς');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Άγνωστο σφάλμα';
      toast.error(`Σφάλμα κατά τη διαγραφή: ${message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteSale,
    isLoading,
  };
}
