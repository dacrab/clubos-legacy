import useSWR from 'swr';
import { useCallback } from 'react';
import { createClientSupabase } from "@/lib/supabase/client";
import type { SaleWithDetails } from "@/types/sales";
import { getSalesQuery } from "@/lib/utils/salesUtils";

// Types for filter parameters
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

// Function to generate a stable key for SWR based on filters
const generateSalesKey = (filters?: SalesFilters) => {
  if (!filters) return 'sales';
  
  const { dateRange, timeRange, limit, searchQuery } = filters;
  let key = 'sales';
  
  if (dateRange?.startDate && dateRange?.endDate) {
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
const fetchSalesData = async (filters?: SalesFilters): Promise<SaleWithDetails[]> => {
  const supabase = createClientSupabase();
  
  // Start with basic query
  let query = supabase
    .from('sales')
    .select(getSalesQuery())
    .order('created_at', { ascending: false });
  
  // Apply date range filter if provided
  if (filters?.dateRange?.startDate && filters?.dateRange?.endDate) {
    let startDate = filters.dateRange.startDate;
    let endDate = filters.dateRange.endDate;
    
    // Apply time range if provided
    if (filters?.timeRange) {
      const { startTime, endTime } = filters.timeRange;
      if (startTime) {
        startDate = `${startDate}T${startTime}:00`;
      } else {
        startDate = `${startDate}T00:00:00`;
      }
      
      if (endTime) {
        endDate = `${endDate}T${endTime}:00`;
      } else {
        endDate = `${endDate}T23:59:59`;
      }
    } else {
      startDate = `${startDate}T00:00:00`;
      endDate = `${endDate}T23:59:59`;
    }
    
    query = query
      .gte('created_at', startDate)
      .lte('created_at', endDate);
  }
  
  // Apply limit if provided
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching sales data:', error);
    throw new Error(error.message);
  }
  
  return data as unknown as SaleWithDetails[];
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
    mutate 
  } = useSWR(
    key, 
    () => fetchSalesData(filters),
    {
      // Configure SWR options for optimal performance
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 30000, // Refresh every 30 seconds
      dedupingInterval: 5000, // Prevent duplicate requests in quick succession
    }
  );
  
  // Method to force refresh the data
  const refreshData = useCallback(() => {
    return mutate();
  }, [mutate]);
  
  // Apply client-side search filter if needed
  const filteredSales = useCallback(() => {
    if (!sales || !filters?.searchQuery) return sales;
    
    const query = filters.searchQuery.toLowerCase();
    return sales.filter(sale => 
      sale.product.name.toLowerCase().includes(query) ||
      (sale.product.category?.name || "").toLowerCase().includes(query)
    );
  }, [sales, filters?.searchQuery]);
  
  return {
    sales: (filters?.searchQuery ? filteredSales() : sales) || [],
    isLoading,
    isValidating,
    error,
    refreshData,
  };
} 