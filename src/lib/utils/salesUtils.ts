import { Sale, Product, SaleWithDetails, GroupedSale } from "@/types/sales";
import { CARD_DISCOUNT } from "@/lib/constants";

export type { GroupedSale };

// --- Types ---

export interface OrderSale {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_treat: boolean;
  coffee_options: any;
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
      !item.is_treat && !item.is_deleted ? sum + item.total_price : sum,
    0
  );
}

export function calculateTreatsValue(items: Sale[]): number {
  return items.reduce(
    (sum, item) =>
      item.is_treat && !item.is_deleted
        ? sum + item.unit_price * item.quantity
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
  if (!sales?.length) return [];

  const orderMap = new Map<string, GroupedSale>();

  for (const sale of sales) {
    if (!sale?.order_id || !sale.order) continue;

    if (!orderMap.has(sale.order_id)) {
      orderMap.set(sale.order_id, {
        id: sale.order_id,
        created_at: sale.order.created_at || new Date().toISOString(),
        total: 0,
        items: [],
        treats_count: 0,
        card_discount_count: sale.order.card_discount_count || 0,
        final_amount: sale.order.final_amount || 0,
        is_card_payment: (sale.order.card_discount_count || 0) > 0,
      });
    }

    const group = orderMap.get(sale.order_id)!;
    group.items.push(sale);

    if (!sale.is_treat && !sale.is_deleted) {
      group.total += sale.total_price;
    }
    if (sale.is_treat && !sale.is_deleted) {
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
  if (!searchQuery) return sales;
  const query = searchQuery.toLowerCase();
  return sales.filter(
    (sale) =>
      sale.product.name.toLowerCase().includes(query) ||
      (sale.product.category?.name || "").toLowerCase().includes(query)
  );
}

// --- Misc ---

export function getActiveItemsCount(sales: Sale[]): number {
  return sales.filter((sale) => !sale.is_deleted).length;
}

export function getSalesQuery() {
  return `
    *,
    product:products (id, name, price, image_url, category:categories (id, name)),
    order:orders (id, created_by, created_at, final_amount, card_discount_count)
  `;
}

// --- Data Transformation ---

export function transformOrderToSales(order: OrderData): SaleWithDetails[] {
  return (order.sales || []).map((sale: OrderSale) => {
    if (!sale.code) throw new Error("Sale must have a code");

    const saleProduct: Product = {
      id: sale.code.id,
      name: sale.code.name,
      price: sale.code.price,
      stock: 0,
      image_url: sale.code.image_url,
      created_at: order.created_at,
      created_by: order.created_by,
      updated_at: null,
      category_id: sale.code.category?.id || "",
      category: sale.code.category
        ? {
            id: sale.code.category.id,
            name: sale.code.category.name,
            description: sale.code.category.description,
            parent_id: null,
            created_at: order.created_at,
            created_by: order.created_by,
          }
        : undefined,
    };

    return {
      id: sale.id,
      order_id: order.id,
      product_id: sale.code.id,
      quantity: sale.quantity,
      unit_price: sale.unit_price,
      total_price: sale.total_price,
      is_treat: sale.is_treat,
      created_at: order.created_at,
      is_deleted: false,
      is_edited: false,
      edited_at: null,
      edited_by: null,
      original_product_name: null,
      original_quantity: null,
      product: saleProduct,
      order: {
        id: order.id,
        register_session_id: "",
        total_amount: order.total_amount,
        final_amount: order.final_amount,
        card_discount_count: order.card_discount_count,
        created_by: order.created_by,
        created_at: order.created_at,
      },
    };
  });
}