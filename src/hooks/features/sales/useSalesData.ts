import { useEffect, useMemo, useState } from 'react';

import type { SaleWithDetails } from '@/types/sales';

export interface SalesFilters {
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  category?: string;
  paymentMethod?: string;
  searchQuery?: string;
  limit?: number;
}

const fetchSalesData = async (filters?: SalesFilters): Promise<SaleWithDetails[]> => {
  try {
    const params = new URLSearchParams();
    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters?.category) {
      params.append('category', filters.category);
    }
    if (filters?.paymentMethod) {
      params.append('paymentMethod', filters.paymentMethod);
    }
    if (filters?.limit) {
      params.append('limit', filters.limit.toString());
    }

    const response = await fetch(`/api/sales?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch sales data');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      (await import('@/lib/utils/logger')).logger.error('Error fetching sales data:', error);
    }
    return [];
  }
};

export function useSalesData(filters?: SalesFilters, initialData?: SaleWithDetails[]) {
  const [sales, setSales] = useState<SaleWithDetails[]>(initialData || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchSalesData(filters);
        setSales(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [filters]);

  const filteredSales = useMemo(() => {
    let filtered = sales;

    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        sale =>
          sale.productName?.toLowerCase().includes(query) || sale.id.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [sales, filters?.searchQuery]);

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchSalesData(filters);
      setSales(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sales: filteredSales,
    isLoading,
    error,
    refreshData,
  };
}
