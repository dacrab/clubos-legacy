import { CARD_DISCOUNT, STATISTICS } from '@/lib/constants';
import type { Database } from '@/types/supabase';
export type SaleLike = Database['public']['Tables']['sales']['Row'] & {
  code?: { name: string; category?: { name: string } | null } | null;
  order?: { id: string; card_discounts_applied: number } | null;
};

// Types
type ChartDataItem = {
  name: string;
  value: number;
  total: number;
  percentage?: string;
};

export type GroupedSale = {
  id: string;
  created_at: string;
  total: number;
  items: SaleLike[];
  treats_count: number;
  card_discount_count: number; // kept for UI, derived from order.card_discounts_applied
  final_amount: number;
  is_card_payment: boolean;
};

// Constants
const HOURS_IN_DAY = 23;
const MINUTES_IN_HOUR = 59;
const SECONDS_IN_MINUTE = 59;
const MILLISECONDS_IN_SECOND = 999;

export const CHART_STYLES = {
  colors: {
    primary: 'hsl(var(--primary))',
    green: 'hsl(142.1 76.2% 36.3%)',
    yellow: 'hsl(47.9 95.8% 53.1%)',
    red: 'hsl(0 84.2% 60.2%)',
    blue: 'hsl(217.2 91.2% 59.8%)',
  },
  tooltip: {
    background: 'hsl(var(--background))',
    border: 'hsl(var(--border))',
    text: 'hsl(var(--foreground))',
    textMuted: 'hsl(var(--muted-foreground))',
  },
  grid: {
    stroke: 'hsl(var(--border))',
  },
  axis: {
    stroke: 'hsl(var(--muted-foreground))',
    fontSize: 12,
  },
} as const;

export const MEDAL_COLORS = {
  0: 'text-yellow-500', // Gold
  1: 'text-gray-400', // Silver
  2: 'text-amber-600', // Bronze
  default: 'text-muted-foreground',
} as const;

// Date-related functions
/**
 * Filters sales by date range
 */
export function filterSalesByDateRange(
  sales: SaleLike[],
  dateRange: { startDate: string | null; endDate: string | null } | null
): SaleLike[] {
  // First filter out deleted sales
  const activeSales = sales.filter((sale) => !sale.is_deleted);

  if (!(dateRange?.startDate && dateRange.endDate)) {
    return activeSales;
  }

  return activeSales.filter((sale) => {
    const saleDate = new Date(sale.created_at);
    const startDate = new Date(dateRange.startDate ?? '');
    const endDate = new Date(dateRange.endDate ?? '');
    endDate.setHours(HOURS_IN_DAY, MINUTES_IN_HOUR, SECONDS_IN_MINUTE, MILLISECONDS_IN_SECOND); // Include the entire end day

    return saleDate >= startDate && saleDate <= endDate;
  });
}

/**
 * Groups sales by date and aggregates quantities
 */
export function aggregateSalesByDate(
  sales: SaleLike[],
  valueKey: 'quantity' | 'total_price',
  dataKey?: string
): Array<{ date: string; [key: string]: number | string | undefined }> {
  // Filter out deleted sales
  const activeSales = sales.filter((sale) => !sale.is_deleted);

  const aggregated = activeSales.reduce(
    (acc, sale) => {
      const date = new Date(sale.created_at).toLocaleDateString('el');
      // Only include non-treat sales in the aggregation
      if (!sale.is_treat) {
        // Use exact precision for monetary values
        if (valueKey === 'total_price') {
          acc[date] = (acc[date] || 0) + sale[valueKey];
        } else {
          acc[date] = (acc[date] || 0) + sale[valueKey];
        }
      }
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(aggregated)
    .map(([date, value]) => ({
      date,
      [dataKey || (valueKey === 'total_price' ? 'revenue' : 'quantity')]: value,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-STATISTICS.DEFAULT_DAYS_TO_SHOW);
}

/**
 * Aggregates sales by category and aggregates quantities
 */
export function aggregateSalesByCategory(sales: SaleLike[], categoryName: string): ChartDataItem[] {
  if (!categoryName) {
    return [];
  }

  // Filter out deleted sales
  const activeSales = sales.filter((sale) => !sale.is_deleted);

  const salesByItem = activeSales.reduce(
    (acc, sale) => {
      if (sale.code?.category && sale.code.category.name === categoryName && !sale.is_treat) {
        const itemName = sale.code.name;
        acc[itemName] = acc[itemName] ?? { name: itemName, value: 0, total: 0 };
        acc[itemName].value += sale.quantity;
        acc[itemName].total += sale.total_price;
      }
      return acc;
    },
    {} as Record<string, ChartDataItem>
  );

  return Object.values(salesByItem)
    .sort((a, b) => b.value - a.value)
    .slice(0, STATISTICS.DEFAULT_TOP_CODES_COUNT);
}

/**
 * Calculates various sales statistics consistent with RegisterClosingsList and ClosingDetails
 */
export function calculateSalesStats(sales: SaleLike[]) {
  // Filter out deleted sales
  const activeSales = sales.filter((sale) => !sale.is_deleted);

  // Group sales by payment method and treat status
  const nonTreatSales = activeSales.filter((s) => !s.is_treat);
  const treatSales = activeSales.filter((s) => s.is_treat);

  // Group sales by payment type based on order's card discount count
  const cashSales = activeSales.filter((s) => !(s.is_treat || s.order?.card_discounts_applied));
  const cardSales = activeSales.filter((s) => !s.is_treat && s.order?.card_discounts_applied);

  // Calculate card discount based on order data
  // We need to count each order's card_discount_count only once to avoid duplicates
  const uniqueOrders = Array.from(new Set(cardSales.map((s) => s.order?.id)))
    .map((id) => cardSales.find((s) => s.order?.id === id)?.order)
    .filter((o): o is NonNullable<SaleLike['order']> => Boolean(o));

  const cardDiscountCount = uniqueOrders.reduce(
    (sum, order) => sum + (order.card_discounts_applied || 0),
    0
  );
  // Use exact precision for card discount amount
  const cardDiscountAmount = +(cardDiscountCount * CARD_DISCOUNT).toFixed(2);

  // Calculate treat value (actual monetary value of treats) with exact precision
  const treatsAmount = +treatSales
    .reduce((sum, sale) => sum + +(sale.unit_price * sale.quantity).toFixed(2), 0)
    .toFixed(2);

  // Calculate final amounts after discounts with exact precision
  const totalBeforeDiscounts = +nonTreatSales
    .reduce((sum, sale) => sum + sale.total_price, 0)
    .toFixed(2);

  // Calculate cash and card revenues with exact precision
  const cashRevenue = +cashSales.reduce((sum, sale) => sum + sale.total_price, 0).toFixed(2);

  // We need to pro-rate the discount across all items in an order
  // First, group card sales by order
  const salesByOrder = cardSales.reduce(
    (acc, sale) => {
      const orderId = sale.order?.id || 'unknown';
      if (!acc[orderId]) {
        acc[orderId] = [];
      }
      acc[orderId].push(sale);
      return acc;
    },
    {} as Record<string, SaleLike[]>
  );

  // Then calculate the revenue for each order with proper discount distribution and exact precision
  const cardRevenue = +Object.values(salesByOrder)
    .reduce((totalRevenue, orderSales) => {
      const firstSale = orderSales.at(0);
      if (!firstSale?.order) {
        return totalRevenue;
      }

      const order = firstSale.order;
      const orderTotal = +orderSales.reduce((sum, sale) => sum + sale.total_price, 0).toFixed(2);
      const orderDiscount = +((order.card_discounts_applied || 0) * CARD_DISCOUNT).toFixed(2);

      // Apply the discount proportionally to the order total with exact precision
      const orderRevenue = Math.max(0, +(orderTotal - orderDiscount).toFixed(2));
      return +(totalRevenue + orderRevenue).toFixed(2);
    }, 0)
    .toFixed(2);

  // Calculate final total with exact precision
  const finalTotalAmount = +(cashRevenue + cardRevenue).toFixed(2);

  return {
    // Sales quantities
    totalSales: nonTreatSales.reduce((sum, sale) => sum + sale.quantity, 0),
    cashSalesCount: cashSales.reduce((sum, sale) => sum + sale.quantity, 0),
    cardSalesCount: cardSales.reduce((sum, sale) => sum + sale.quantity, 0),
    treatCount: treatSales.reduce((sum, sale) => sum + sale.quantity, 0),

    // Revenue figures
    totalBeforeDiscounts,
    cardDiscountCount,
    cardDiscountAmount,
    treatsAmount,

    // Final amounts
    totalRevenue: finalTotalAmount,
    cashRevenue,
    cardRevenue,

    // Analytics
    averageOrderValue: nonTreatSales.length
      ? +(totalBeforeDiscounts / nonTreatSales.length).toFixed(2)
      : 0,
    uniqueCodes: new Set(activeSales.map((sale) => sale.code_id)).size,
  };
}
