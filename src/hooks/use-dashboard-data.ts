import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { LOW_STOCK_THRESHOLD, UNLIMITED_STOCK } from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase/client';
import { fetchProductsForUI } from '@/lib/utils/products';
import type { Database } from '@/types/supabase';
import type { ProductWithCategory } from '@/types/database';
import { useErrorHandling } from './use-error-handling';

type Product = Database['public']['Tables']['products']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'] | null;
};

type User = Database['public']['Tables']['users']['Row'];

type UseDashboardDataProps = {
  isAdmin?: boolean;
  autoFetch?: boolean;
  enableErrorToasts?: boolean;
};

type DashboardDataState = {
  products: Product[];
  users: User[];
  lowStockProducts: Product[];
  loading: boolean;
  error: string | null;
};

type DashboardDataActions = {
  refetchProducts: () => Promise<void>;
  refetchUsers: () => Promise<void>;
  refetchAll: () => Promise<void>;
  reset: () => void;
};

// Fetcher functions
const fetchProducts = async (isAdmin: boolean): Promise<Product[]> => {
  const supabase = createClientSupabase();
  const data = await fetchProductsForUI(supabase, { isAdmin });
  return (data as Product[]) || [];
};

const fetchUsers = async (): Promise<User[]> => {
  const supabase = createClientSupabase();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('username');
  
  if (error) {
    throw new Error(error.message);
  }
  
  return (data as User[]) || [];
};

const fetchLowStockProducts = async (): Promise<Product[]> => {
  const supabase = createClientSupabase();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .lt('stock_quantity', LOW_STOCK_THRESHOLD)
    .neq('stock_quantity', UNLIMITED_STOCK)
    .order('stock_quantity', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as Product[]) || [];
};

export function useDashboardData({
  isAdmin = false,
  autoFetch = true,
  enableErrorToasts = true,
}: UseDashboardDataProps = {}): DashboardDataState & DashboardDataActions {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { error, handleError, reset } = useErrorHandling({
    showToasts: enableErrorToasts,
    defaultErrorMessage: 'Σφάλμα φόρτωσης δεδομένων',
  });

  // Use SWR for products with admin dependency
  const {
    data: productsData,
    error: productsError,
    isLoading: isLoadingProducts,
    mutate: mutateProducts,
  } = useSWR(
    autoFetch ? ['products', isAdmin] : null,
    () => fetchProducts(isAdmin),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30_000,
    }
  );

  // Use SWR for users (admin only)
  const {
    data: usersData,
    error: usersError,
    isLoading: isLoadingUsers,
    mutate: mutateUsers,
  } = useSWR(
    autoFetch && isAdmin ? 'users' : null,
    fetchUsers,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60_000,
    }
  );

  // Use SWR for low stock products (admin only)
  const {
    data: lowStockData,
    error: lowStockError,
    isLoading: isLoadingLowStock,
    mutate: mutateLowStock,
  } = useSWR(
    autoFetch && isAdmin ? 'low-stock' : null,
    fetchLowStockProducts,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60_000,
    }
  );

  // Update local state when SWR data changes
  useEffect(() => {
    if (productsData) {
      setProducts(productsData);
    }
  }, [productsData]);

  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
    }
  }, [usersData]);

  useEffect(() => {
    if (lowStockData) {
      setLowStockProducts(lowStockData);
    }
  }, [lowStockData]);

  // Handle errors
  useEffect(() => {
    const error = productsError || usersError || lowStockError;
    if (error) {
      handleError(error);
    }
  }, [productsError, usersError, lowStockError, handleError]);

  const refetchProducts = useCallback(async () => {
    await mutateProducts();
  }, [mutateProducts]);

  const refetchUsers = useCallback(async () => {
    await mutateUsers();
  }, [mutateUsers]);

  const refetchAll = useCallback(async () => {
    await Promise.all([mutateProducts(), mutateUsers(), mutateLowStock()]);
  }, [mutateProducts, mutateUsers, mutateLowStock]);

  const isLoading = isLoadingProducts || isLoadingUsers || isLoadingLowStock;

  return {
    products,
    users,
    lowStockProducts,
    loading: isLoading,
    error,
    refetchProducts,
    refetchUsers,
    refetchAll,
    reset,
  };
}
