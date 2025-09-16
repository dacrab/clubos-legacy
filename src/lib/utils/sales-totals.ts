import { CARD_DISCOUNT } from '@/lib/constants';
import type { GroupedSale, SaleLike } from './chart-utils';

export function computeOrderTotalsFromItems(
  items: Array<Pick<SaleLike, 'is_treat' | 'total_price'> & { is_deleted?: boolean }>,
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
