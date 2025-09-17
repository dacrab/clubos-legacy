import { useCallback, useEffect, useState } from 'react';
import { useErrorHandling } from '@/hooks/use-error-handling';
import { createClientSupabase } from '@/lib/supabase/client';
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
  reset: () => void;
};

export function useProductManagement({
  isAdmin = false,
  autoFetch = true,
  enableErrorToasts = true,
}: UseProductManagementProps = {}): ProductManagementState & ProductManagementActions {
  const [products, setProducts] = useState<Code[]>([]);
  const [loading, setLoading] = useState(false);
  const { error, handleError, reset } = useErrorHandling({
    showToasts: enableErrorToasts,
    defaultErrorMessage: 'Σφάλμα φόρτωσης προϊόντων',
  });
  const supabase = createClientSupabase();

  const fetchProducts = useCallback(async (): Promise<void> => {
    setLoading(true);
    reset();
    try {
      const data = await fetchProductsForUI(supabase, { isAdmin });
      setProducts((data as Code[]) || []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [supabase, isAdmin, handleError, reset]);

  const refetch = useCallback(() => {
    return fetchProducts();
  }, [fetchProducts]);

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
    reset,
  };
}
