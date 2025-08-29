import { CARD_DISCOUNT } from "@/lib/constants";
import { type Sale } from "@/types/sales";

/**
 * Interface for grouped sales by order
 */
export interface GroupedSale {
  id: string;
  created_at: string;
  total: number;
  items: Sale[];
  treats_count: number;
  card_discount_count: number;
  final_amount: number;
  is_card_payment?: boolean;
}

/**
 * Calculate subtotal excluding treats and deleted items
 */
export function calculateNonTreatSubtotal(items: Sale[]): number {
  return items
    .filter(item => !item.is_treat && !item.is_deleted)
    .reduce((sum, item) => sum + item.total_price, 0);
}

/**
 * Calculate value of treat items (excluding deleted ones)
 */
export function calculateTreatsValue(items: Sale[]): number {
  return items
    .filter(item => item.is_treat && !item.is_deleted)
    .reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
}

/**
 * Calculate discount amount based on card discount count
 */
export function calculateDiscountAmount(cardDiscountCount: number): number {
  return +(cardDiscountCount * CARD_DISCOUNT).toFixed(2);
}

/**
 * Calculate final amount after discounts
 */
export function calculateFinalAmount(nonTreatSubtotal: number, discountAmount: number): number {
  return Math.max(0, +(nonTreatSubtotal - discountAmount).toFixed(2));
}

/**
 * Group sales into orders for display purposes
 */
export function groupSalesIntoOrders(sales: Sale[] | null | undefined): GroupedSale[] {
  if (!sales?.length) {return [];}
  
  const orderMap = new Map<string, GroupedSale>();

  sales.forEach((sale) => {
    if (!sale.order_id || !sale.order) {return;}
    
    if (!orderMap.has(sale.order_id)) {
      orderMap.set(sale.order_id, {
        id: sale.order_id,
        created_at: sale.order.created_at || new Date().toISOString(),
        total: 0,
        items: [],
        treats_count: 0,
        card_discount_count: sale.order.card_discount_count || 0,
        final_amount: sale.order.final_amount || 0,
        is_card_payment: (sale.order.card_discount_count || 0) > 0
      });
    }

    const group = orderMap.get(sale.order_id)!;
    group.items.push(sale);
    
    // Only add non-treats and non-deleted items to total
    if (!sale.is_treat && !sale.is_deleted) {
      group.total += sale.total_price;
    }
    
    // Just count the number of non-deleted treat items
    if (sale.is_treat && !sale.is_deleted) {
      group.treats_count += sale.quantity;
    }
  });

  return Array.from(orderMap.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/**
 * Calculate all totals for a group of sales
 */
export function calculateGroupTotals(group: GroupedSale) {
  const nonTreatSubtotal = calculateNonTreatSubtotal(group.items);
  const treatsValue = calculateTreatsValue(group.items);
  const discountAmount = calculateDiscountAmount(group.card_discount_count);
  const calculatedFinalAmount = calculateFinalAmount(nonTreatSubtotal, discountAmount);
  
  return {
    nonTreatSubtotal,
    treatsValue,
    discountAmount,
    calculatedFinalAmount
  };
}

/**
 * Get active (non-deleted) items count
 */
export function getActiveItemsCount(sales: Sale[]): number {
  return sales.filter(sale => !sale.is_deleted).length;
}

/**
 * Filter sales by search query
 */
export function filterSalesBySearchQuery(sales: Sale[], searchQuery: string): Sale[] {
  if (!searchQuery) {return sales;}
  
  const query = searchQuery.toLowerCase();
  return sales.filter(sale => 
    sale.code.name.toLowerCase().includes(query) ||
    (sale.code.category?.name || "").toLowerCase().includes(query)
  );
}

/**
 * Get standard Supabase query for fetching sales
 */
export function getSalesQuery() {
  return `
    *,
    code:codes (id, name, price, image_url, category:categories (id, name)),
    order:orders (id, created_by, created_at, final_amount, card_discount_count)
  `;
} 