import { Tables } from "./supabase";
import { Product, Category } from "./products";

export type { Product, Category };

// Base types from Database, re-exported for convenience
export type Sale = Tables<'sales'>;
export type Order = Tables<'orders'>;

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