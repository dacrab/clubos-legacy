import { CARD_DISCOUNT } from "@/lib/constants";
import type { Sale, SaleWithDetails, GroupedSale } from "@/types/sales";

export type { GroupedSale };

// --- Types ---

export interface OrderSale {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_treat: boolean;
  coffee_options: Record<string, unknown>;
  code?: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    category?: {
      id: string;
      name: string;
      description: string | null;
    } | null;
  };
}

export interface OrderData {
  id: string;
  created_at: string;
  total_amount: number;
  final_amount: number;
  card_discount_count: number;
  created_by: string;
  sales?: OrderSale[];
}

// --- Calculation Utilities ---

export function calculateNonTreatSubtotal(items: Sale[]): number {
  return items.reduce(
    (sum, item) =>
      !item.isTreat ? sum + parseFloat(item.totalPrice) : sum,
    0
  );
}

export function calculateTreatsValue(items: Sale[]): number {
  return items.reduce(
    (sum, item) =>
      item.isTreat
        ? sum + parseFloat(item.unitPrice) * item.quantity
        : sum,
    0
  );
}

export function calculateDiscountAmount(cardDiscountCount: number): number {
  return +(cardDiscountCount * CARD_DISCOUNT).toFixed(2);
}

export function calculateFinalAmount(
  nonTreatSubtotal: number,
  discountAmount: number
): number {
  return Math.max(0, +(nonTreatSubtotal - discountAmount).toFixed(2));
}

export function calculateGroupTotals(group: GroupedSale) {
  const nonTreatSubtotal = calculateNonTreatSubtotal(group.items);
  const treatsValue = calculateTreatsValue(group.items);
  const discountAmount = calculateDiscountAmount(group.card_discount_count);
  const calculatedFinalAmount = calculateFinalAmount(
    nonTreatSubtotal,
    discountAmount
  );
  return {
    nonTreatSubtotal,
    treatsValue,
    discountAmount,
    calculatedFinalAmount,
  };
}

// --- Grouping & Filtering ---

export function groupSalesIntoOrders(
  sales: SaleWithDetails[] | null | undefined
): GroupedSale[] {
  if (!sales?.length) {return [];}

  const orderMap = new Map<string, GroupedSale>();

  for (const sale of sales) {
    if (!sale?.orderId || !sale.order) {continue;}

    if (!orderMap.has(sale.orderId)) {
      orderMap.set(sale.orderId, {
        id: sale.orderId,
        created_at: sale.order.createdAt?.toISOString() || new Date().toISOString(),
        total: 0,
        items: [],
        treats_count: 0,
        card_discount_count: sale.order.cardDiscountCount || 0,
        final_amount: parseFloat(sale.order.finalAmount || '0'),
        is_card_payment: (sale.order.cardDiscountCount || 0) > 0,
      });
    }

    const group = orderMap.get(sale.orderId);
    if (!group) {
      continue;
    }
    group.items.push(sale);

    if (!sale.isTreat) {
      group.total += parseFloat(sale.totalPrice);
    }
    if (sale.isTreat) {
      group.treats_count += sale.quantity;
    }
  }

  return Array.from(orderMap.values()).sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function filterSalesBySearchQuery(
  sales: SaleWithDetails[],
  searchQuery: string
): SaleWithDetails[] {
  if (!searchQuery) {return sales;}
  const query = searchQuery.toLowerCase();
  return sales.filter(
    (sale) =>
      sale.product.name.toLowerCase().includes(query) ||
      (sale.product.category?.name || "").toLowerCase().includes(query)
  );
}

// --- Misc ---

export function getActiveItemsCount(sales: Sale[]): number {
  return sales.length; // Drizzle only returns active records
}

export function getSalesQuery() {
  return `
    *,
    product:products (id, name, price, image_url, category:categories (id, name)),
    order:orders (id, created_by, created_at, final_amount, card_discount_count)
  `;
}

// --- Data Transformation ---
// Legacy Supabase transformation functions removed during Drizzle migration