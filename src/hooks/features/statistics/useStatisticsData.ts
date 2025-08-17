import { useState, useEffect } from 'react';

import type { Category } from '@/types/products';

interface StatisticsData {
  categories: Category[];
  totalSales: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export function useStatisticsData() {
  const [data, setData] = useState<StatisticsData>({
    categories: [],
    totalSales: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStatisticsData() {
      setLoading(true);
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) {throw new Error('Failed to fetch categories');}
        const categories = await categoriesResponse.json();

        // Fetch sales for statistics
        const salesResponse = await fetch('/api/sales');
        if (!salesResponse.ok) {throw new Error('Failed to fetch sales');}
        const sales = await salesResponse.json();

        // Calculate statistics
        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum: number, sale: { totalPrice?: string | number }) =>
          sum + parseFloat(String(sale.totalPrice || '0')), 0
        );
        const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
        
        setData({
          categories,
          totalSales,
          totalRevenue,
          averageOrderValue,
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchStatisticsData();
  }, []);

  return { data, loading, error };
}