import type { Product, Category } from "./products";
// Removed Supabase Tables import - migrated to Drizzle

export type { Product, Category };

// Define Sale and Order types based on Drizzle schema
export interface Sale {
  id: string;
  orderId: string;
  productId: string;
  productName: string; // Snapshot for historical data
  quantity: number;
  unitPrice: string; // Decimal as string
  totalPrice: string; // Decimal as string
  isTreat: boolean;
  isVoided: boolean;
  voidReason?: string | null;
  createdAt: Date;
  voidedAt?: Date | null;
  voidedBy?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  registerSessionId: string;
  customerName?: string | null;
  subtotal: string; // Decimal as string
  taxAmount: string;
  discountAmount: string;
  totalAmount: string;
  finalAmount: string;
  paymentMethod: 'cash' | 'card' | 'treat';
  cardDiscountCount: number;
  isVoided: boolean;
  voidReason?: string | null;
  createdAt: Date;
  createdBy: string;
  voidedAt?: Date | null;
  voidedBy?: string | null;
}

// Organization Types
export type CategoriesMap = {
  [key: string]: Category[];
};

/**
 * UI-specific type for items in the new sale/cart interface.
 */
export type OrderItem = {
  id: string; // A temporary client-side ID
  product: Product;
  quantity: number;
  isTreat: boolean;
  dosageCount?: number;
};

/**
 * A "rich" Order type for use in the application, with nested sales.
 */
export type OrderWithSales = Order & {
  sales: SaleWithDetails[];
};

/**
 * A "rich" Sale type for use in the application, with nested product and order details.
 * This is the shape returned by most sales queries.
 */
export type SaleWithDetails = Sale & {
  product: Product;
  order: Order;
};

/**
 * Represents a group of sales, usually aggregated by order.
 */
export interface GroupedSale {
  id: string;
  created_at: string;
  total: number;
  items: SaleWithDetails[];
  treats_count: number;
  card_discount_count: number;
  final_amount: number;
  is_card_payment?: boolean;
}

/**
 * Represents a new sale to be created.
 */
export type NewSale = {
  items: OrderItem[];
  totalAmount: number;
  finalAmount: number;
  cardDiscountCount: number;
};