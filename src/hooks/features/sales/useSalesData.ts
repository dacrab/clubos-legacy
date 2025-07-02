import useSWR from 'swr';
import { useCallback, useMemo } from 'react';
import { createClientSupabase } from "@/lib/supabase/client";
import type { SaleWithDetails } from "@/types/sales";
import { getSalesQuery } from "@/lib/utils/salesUtils";

export interface SalesDateRange {
  startDate: string;
  endDate: string;
}

export interface TimeRange {
  startTime: string;
  endTime: string;
}

export interface SalesFilters {
  dateRange?: SalesDateRange;
  timeRange?: TimeRange;
  limit?: number;
  searchQuery?: string;
}

const generateSalesKey = (filters?: SalesFilters) => {
  if (!filters) return 'sales';
  
  const parts = [
    filters.dateRange && `${filters.dateRange.startDate}-${filters.dateRange.endDate}`,
    filters.timeRange && `${filters.timeRange.startTime || '00:00'}-${filters.timeRange.endTime || '23:59'}`,
    filters.limit && `limit-${filters.limit}`,
    filters.searchQuery && `search-${filters.searchQuery}`
  ].filter(Boolean);

  return parts.length ? `sales-${parts.join('-')}` : 'sales';
};

const buildDateTimeString = (date: string, time?: string) => 
  `${date}T${time ? `${time}:00` : '00:00:00'}`;

const fetchSalesData = async (filters?: SalesFilters): Promise<SaleWithDetails[]> => {
  const supabase = createClientSupabase();
  let query = supabase
    .from('sales')
    .select(getSalesQuery())
    .order('created_at', { ascending: false });

  if (filters?.dateRange) {
    const { startDate, endDate } = filters.dateRange;
    const startTime = filters.timeRange?.startTime;
    const endTime = filters.timeRange?.endTime;

    query = query
      .gte('created_at', buildDateTimeString(startDate, startTime))
      .lte('created_at', buildDateTimeString(endDate, endTime || '23:59'));
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as SaleWithDetails[];
};

export function useSalesData(filters?: SalesFilters, initialData?: SaleWithDetails[]) {
  const key = useMemo(() => generateSalesKey(filters), [filters]);
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key, 
    () => fetchSalesData(filters),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      fallbackData: initialData
    }
  );

  const filteredSales = useMemo(() => {
    if (!data || !filters?.searchQuery) return data;
    const query = filters.searchQuery.toLowerCase();
    return data.filter(sale => 
      sale.product.name.toLowerCase().includes(query) ||
      sale.product.category?.name?.toLowerCase().includes(query)
    );
  }, [data, filters?.searchQuery]);

  return {
    sales: filteredSales || data || [],
    isLoading,
    isValidating,
    error,
    refreshData: () => mutate(),
  };
}