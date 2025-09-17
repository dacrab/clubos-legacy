import { CARD_DISCOUNT } from '@/lib/constants';
import type { ListItem } from '@/types/register';
import type { GroupedSale, SaleLike } from './chart-utils';

export function computeOrderTotalsFromItems(
  items: Array<Pick<SaleLike, 'is_treat' | 'total_price'> & { is_deleted?: boolean | null }>,
  couponsCount: number
) {
  const grossSubtotal = items.reduce(
    (sum, item) => (item.is_deleted ? sum : sum + item.total_price),
    0
  );
  const treatsValue = items.reduce(
    (sum, item) => (item.is_treat && !item.is_deleted ? sum + item.total_price : sum),
    0
  );
  const discountAmount = couponsCount * CARD_DISCOUNT;
  const finalAmount = Math.max(0, grossSubtotal - treatsValue - discountAmount);
  return { grossSubtotal, treatsValue, discountAmount, finalAmount };
}

export function computeGroupedSaleTotals(group: GroupedSale) {
  const { grossSubtotal, treatsValue, discountAmount, finalAmount } = computeOrderTotalsFromItems(
    group.items,
    group.card_discount_count || 0
  );
  return { grossSubtotal, treatsValue, discountAmount, finalAmount };
}

// Implement calculateStats function
export function calculateStats(items: ListItem[]): {
  totalSessions: number;
  activeSessions: number;
  closedSessions: number;
  totalRevenue: number;
  totalCashSales: number;
  totalCardSales: number;
  totalTreats: number;
  totalDiscounts: number;
} {
  const stats = {
    totalSessions: items.length,
    activeSessions: 0,
    closedSessions: 0,
    totalRevenue: 0,
    totalCashSales: 0,
    totalCardSales: 0,
    totalTreats: 0,
    totalDiscounts: 0,
  };

  for (const item of items) {
    if (item.type === 'active') {
      stats.activeSessions++;
    } else if (item.type === 'closed' || item.type === 'closing') {
      stats.closedSessions++;

      if (item.closing) {
        stats.totalCashSales += item.closing.cash_sales_total;
        stats.totalCardSales += item.closing.card_sales_total;
        stats.totalTreats += item.closing.treat_count;
        stats.totalDiscounts += item.closing.total_discounts;
      }
    }
  }

  stats.totalRevenue = stats.totalCashSales + stats.totalCardSales;

  return stats;
}
