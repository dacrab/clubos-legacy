import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { createClientSupabase } from '@/lib/supabase';
import { fetchProductsForUI } from '@/lib/utils/products';
import type { Database } from '@/types/supabase';

type Code = Database['public']['Tables']['products']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'] | null;
};

type UseProductManagementProps = {
  isAdmin?: boolean;
  autoFetch?: boolean;
  enableErrorToasts?: boolean;
};

type ProductManagementState = {
  products: Code[];
  loading: boolean;
  error: string | null;
};

type ProductManagementActions = {
  fetchProducts: () => Promise<void>;
  refetch: () => Promise<void>;
  clearError: () => void;
};

export function useProductManagement({
  isAdmin = false,
  autoFetch = true,
  enableErrorToasts = true,
}: UseProductManagementProps = {}): ProductManagementState & ProductManagementActions {
  const [products, setProducts] = useState<Code[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientSupabase();

  const fetchProducts = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductsForUI(supabase, { isAdmin });
      setProducts((data as Code[]) || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Σφάλμα φόρτωσης προϊόντων';
      setError(errorMessage);
      if (enableErrorToasts) {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [supabase, isAdmin, enableErrorToasts]);

  const refetch = useCallback(() => {
    return fetchProducts();
  }, [fetchProducts]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [autoFetch, fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    refetch,
    clearError,
  };
}
