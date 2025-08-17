import { useState } from 'react';
import { toast } from 'sonner';

export interface StockUpdate {
  productId: string;
  newStock: number;
  reason?: string;
}

export function useStockManagement() {
  const [isLoading, setIsLoading] = useState(false);

  const updateStock = async (update: StockUpdate) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${update.productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: update.newStock })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update stock');
      }
      
      toast.success('Το απόθεμα ενημερώθηκε επιτυχώς');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Άγνωστο σφάλμα';
      toast.error(`Σφάλμα ενημέρωσης αποθέματος: ${message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getLowStockProducts = async () => {
    try {
      const response = await fetch('/api/products?filter=low-stock');
      if (!response.ok) {
        throw new Error('Failed to fetch low stock products');
      }
      return await response.json();
    } catch (error) {
      (await import('@/lib/utils/logger')).logger.error('Error fetching low stock products:', error);
      return [];
    }
  };

  return {
    updateStock,
    getLowStockProducts,
    isLoading,
  };
}