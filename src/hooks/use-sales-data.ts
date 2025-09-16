import { useCallback } from 'react';
import useSWR from 'swr';

import { createClientSupabase } from '@/lib/supabase';
import type { Sale } from '@/types/register';
import type { Database } from '@/types/supabase';

// Types for filter parameters
export type SalesDateRange = {
  startDate: string;
  endDate: string;
};

export type TimeRange = {
  startTime: string;
  endTime: string;
};

export type SalesFilters = {
  dateRange?: SalesDateRange;
  timeRange?: TimeRange;
  limit?: number;
  searchQuery?: string;
};

// Function to generate a stable key for SWR based on filters
const generateSalesKey = (filters?: SalesFilters) => {
  if (!filters) {
    return 'sales';
  }

  const { dateRange, timeRange, limit, searchQuery } = filters;
  let key = 'sales';

  if (dateRange?.startDate && dateRange.endDate) {
    key += `-${dateRange.startDate}-${dateRange.endDate}`;
  }

  if (timeRange?.startTime || timeRange?.endTime) {
    key += `-${timeRange.startTime || '00:00'}-${timeRange.endTime || '23:59'}`;
  }

  if (limit) {
    key += `-limit-${limit}`;
  }

  if (searchQuery) {
    key += `-search-${searchQuery}`;
  }

  return key;
};

// Fetch function that applies all the filters
const fetchSalesData = async (filters?: SalesFilters): Promise<Sale[]> => {
  const supabase = createClientSupabase();

  // Build date range
  let startDate: string | undefined;
  let endDate: string | undefined;
  if (filters?.dateRange?.startDate && filters.dateRange.endDate) {
    startDate = `${filters.dateRange.startDate}T${
      filters.timeRange?.startTime ? `${filters.timeRange.startTime}:00` : '00:00:00'
    }`;
    endDate = `${filters.dateRange.endDate}T${
      filters.timeRange?.endTime ? `${filters.timeRange.endTime}:00` : '23:59:59'
    }`;
  }

  let query = supabase
    .from('orders')
    .select(
      `
      id, created_at, created_by, payment_method, card_discounts_applied,
      order_items:order_items(
        id, order_id, quantity, unit_price, line_total, is_treat, is_deleted,
        product:products(id, name, category:categories(id, name))
      )
      `
    )
    .order('created_at', { ascending: false });

  if (startDate && endDate) {
    query = query.gte('created_at', startDate).lte('created_at', endDate);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error((error as Error).message);
  }

  type OrderRow = Database['public']['Tables']['orders']['Row'] & {
    order_items: Array<
      Database['public']['Tables']['order_items']['Row'] & {
        product: Database['public']['Tables']['products']['Row'] & {
          category?: Database['public']['Tables']['categories']['Row'] | null;
        };
      }
    >;
  };

  const sales: Sale[] = (data as unknown as OrderRow[]).flatMap((order) => {
    return (order.order_items || []).map((item) => ({
      id: item.id,
      order_id: order.id,
      code_id: item.product.id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.line_total,
      is_treat: item.is_treat,
      payment_method: order.payment_method,
      sold_by: order.created_by,
      created_at: order.created_at,
      // soft-deletion flags mapped
      is_deleted: item.is_deleted,
      is_edited: false,
      original_code: null,
      original_quantity: null,
      code: {
        id: item.product.id,
        name: item.product.name,
        price: item.unit_price,
        stock: item.product.stock_quantity,
        image_url: item.product.image_url ?? null,
        created_at: item.product.created_at,
        updated_at: item.product.updated_at,
        created_by: item.product.created_by,
        category_id: item.product.category_id ?? null,
      },
      order: {
        id: order.id,
        card_discounts_applied: order.card_discounts_applied,
      } as { id: string; card_discounts_applied: number },
    }));
  });

  return sales;
};

export function useSalesData(filters?: SalesFilters) {
  // Generate a stable key based on the filters for SWR
  const key = generateSalesKey(filters);

  // Use SWR for data fetching with caching and revalidation
  const {
    data: sales,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(key, () => fetchSalesData(filters), {
    // Configure SWR options for optimal performance
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 30_000, // Refresh every 30 seconds
    dedupingInterval: 5000, // Prevent duplicate requests in quick succession
  });

  // Method to force refresh the data
  const refreshData = useCallback(() => {
    return mutate();
  }, [mutate]);

  // Apply client-side search filter if needed
  const filteredSales = useCallback(() => {
    if (!(sales && filters?.searchQuery)) {
      return sales;
    }

    const query = filters.searchQuery.toLowerCase();
    return sales.filter((sale) => (sale.code?.name || '').toLowerCase().includes(query));
  }, [sales, filters?.searchQuery]);

  return {
    sales: filters?.searchQuery ? filteredSales() : sales || [],
    isLoading,
    isValidating,
    error,
    refreshData,
  };
}
