import { type Database } from "./supabase";

// Base types from Database
type Tables = Database['public']['Tables'];

// Core Types
export type Category = Tables['categories']['Row'];
export type Code = Omit<Tables['codes']['Row'], 'category_id'> & {
  category?: Category;
  category_id: string;
};

// Organization Types
export type CategoriesMap = {
  [key: string]: Category[];
};

/**
 * Order related types
 */
export type Order = {
  id: string;
  register_session_id: string;
  total_amount: number;
  final_amount: number;
  card_discount_count: number;
  created_by: string;
  created_at: string;
  sales?: Sale[];
};

export type OrderItem = {
  id: string;
  code: Code;
  codeId: string;
  quantity: number;
  isTreat: boolean;
  dosageCount?: number;
};

/**
 * Sale type - The core sale entity
 * Note: order is optional to prevent circular references
 */
export type Sale = {
  id: string;
  order_id: string;
  code_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_treat: boolean;
  created_at: string;
  code: Code;
  order?: Order;
  // Additional fields for editing functionality
  is_edited?: boolean;
  is_deleted?: boolean;
  original_code?: string;
  original_quantity?: number;
  payment_method?: string; // Added for consistency with transformSession
};