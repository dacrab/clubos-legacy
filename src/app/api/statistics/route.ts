import { NextResponse, type NextRequest } from 'next/server';

import type { SaleWithDetails } from '@/types/sales';
import { stackServerApp } from '@/lib/auth';
import { getSales } from '@/lib/db/services/sales';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Get sales data for statistics
    const sales = await getSales({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    // Calculate basic statistics
    const totalRevenue = sales.reduce((sum, sale) => {
      const price =
        typeof sale.totalPrice === 'string'
          ? sale.totalPrice
          : String((sale as SaleWithDetails).totalPrice ?? '0');
      return sum + parseFloat(price || '0');
    }, 0);
    const totalSales = sales.length;

    // Group sales by category for category statistics
    const categoryStats = sales.reduce(
      (acc: Record<string, { count: number; revenue: number }>, sale) => {
        const category = (sale as SaleWithDetails).product?.category?.name || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = { count: 0, revenue: 0 };
        }
        acc[category].count++;
        const price =
          typeof sale.totalPrice === 'string'
            ? sale.totalPrice
            : String((sale as SaleWithDetails).totalPrice ?? '0');
        acc[category].revenue += parseFloat(price || '0');
        return acc;
      },
      {}
    );

    const statistics = {
      totalRevenue,
      totalSales,
      categoryStats,
      sales, // Include raw sales data for charts
    };

    return NextResponse.json(statistics);
  } catch (error) {
    logger.error('Error fetching statistics:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
