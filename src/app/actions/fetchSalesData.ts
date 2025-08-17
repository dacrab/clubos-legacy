import { cache } from 'react';

import { stackServerApp } from '@/lib/auth';
import { getSalesWithDetails } from '@/lib/db/services/sales';
import type { SaleWithDetails } from '@/types/sales';
import { logger } from '@/lib/utils/logger';

export const getSalesData = cache(async (): Promise<{
  sales: SaleWithDetails[];
  error: string | null;
}> => {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return { sales: [], error: 'Unauthorized' };
    }

    // Fetch sales data using Drizzle service
    const sales = await getSalesWithDetails();
    
    return { sales, error: null };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Error fetching sales data:', error);
    }
    
    return { 
      sales: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch sales data'
    };
  }
});

export const getRecentSalesData = cache(async (limit: number = 10): Promise<{
  sales: SaleWithDetails[];
  error: string | null;
}> => {
  try {
    const { sales, error } = await getSalesData();
    
    if (error) {
      return { sales: [], error };
    }
    
    // Sort by creation date and limit
    const recentSales = sales
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    
    return { sales: recentSales, error: null };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Error fetching recent sales:', error);
    }
    
    return { 
      sales: [], 
      error: error instanceof Error ? error.message : 'Failed to fetch recent sales'
    };
  }
});
