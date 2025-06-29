import type { Database } from './supabase';
import type { Json } from './supabase';
import { CARD_DISCOUNT } from "@/lib/constants";

// Import types from other modules
import type { 
  Sale as SalesTypeSale, 
  Order as SalesOrder,
  SaleWithDetails
} from './sales';

// Re-export the Sale type for convenience, and extend it
export type Sale = SalesTypeSale;
export interface ExtendedSale extends Omit<Sale, 'is_edited' | 'is_deleted' | 'original_code' | 'original_quantity'> {
  is_edited?: boolean;
  is_deleted?: boolean;
  original_code?: string;
  original_quantity?: number;
}

// Base types from database
type Tables = Database['public']['Tables'];

/**
 * USER RELATED TYPES
 */
export type UserRole = 'admin' | 'employee' | 'secretary';

export interface User extends Omit<Tables['users']['Row'], 'role'> {
  role: UserRole;
  username: string;
}

export interface UserDisplay extends User {
  display_name: string;  // Can be username or full name depending on context
}

/**
 * PRODUCT RELATED TYPES
 */
export interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  is_treat: boolean;
  categories?: string[];
}

export interface ProductSummary {
  id: string;
  name: string;
  originalId: string; // Original product ID
  quantity: number;
  totalAmount: number;
  treatCount: number;
  isEdited: boolean;
  isDeleted: boolean;
  originalCode?: string;
  originalQuantity?: number;
}

/**
 * ORDER RELATED TYPES
 */
// Re-export Order type to avoid duplication
export interface Order extends SalesOrder {
  sales: SaleWithDetails[];
}

/**
 * REGISTER SESSION TYPES
 */
export interface RegisterSession {
  id: string;
  opened_at: string;
  opened_by: string;
  closed_at: string | null;
  closed_by: string | null;
  closed_by_name: string | null;
  notes: Json | null;
  created_at: string;
}

export interface RegisterClosing {
  id: string;
  register_session_id: string;
  closed_by_name: string | null;
  treats_count: number;
  card_count: number;
  notes: Json;
  created_at: string;
}

export interface RegisterSessionWithClosings extends RegisterSession {
  register_closings?: RegisterClosing[];
  orders?: Order[];
}

/**
 * DATABASE REPRESENTATION TYPES
 * Used for raw data handling before transformation
 */
export interface DatabaseRegisterSession {
  id: string;
  opened_at: string;
  opened_by: string | null;
  closed_at: string | null;
  closed_by_name: string | null;
  notes: Record<string, any> | null;
  register_closings: Array<{
    id: string;
    register_session_id: string;
    closed_by_name: string;
    treats_count: number;
    card_count: number;
    notes: Record<string, any> | null;
    created_at: string;
  }> | null;
  orders: Array<{
    id: string;
    created_at: string;
    total_amount: number;
    final_amount: number;
    card_discount_count: number;
    sales: Array<{
      id: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      is_treat: boolean;
      is_edited?: boolean;
      is_deleted?: boolean;
      original_code?: string;
      original_quantity?: number;
      codes: {
        id: string;
        name: string;
        price: number;
        categories?: string[];
      } | null;
    }> | null;
  }> | null;
}

/**
 * LIST RELATED TYPES
 */
export interface ActiveSession extends RegisterSession {
  orders?: Order[];
  type: 'active';
}

export interface ClosedSession extends RegisterClosing {
  session: RegisterSession;
  orders?: Order[];
  type: 'closed';
}

export type ListItem = ActiveSession | ClosedSession;

/**
 * STATISTICS TYPES
 */
export interface RegisterSessionStats {
  total_amount: number;
  cash_total: number;
  card_total: number;
  treats_count: number;
  card_count: number;
  cash_count: number;
  average_per_session: number;
}

export interface SessionStats {
  totalCash: number;
  totalCard: number;
  treatsCount: number;
  cardCount: number;
}

export interface ActiveSessionTotals {
  totalBeforeDiscounts: number;
  cardDiscounts: number;
  treats: number;
  treatsAmount: number;
}

export interface TransactionTotals {
  totalBeforeDiscounts: number;
  discount: number;
  cardDiscounts: number;
  treats: number;
  treatsAmount: number;
}

/**
 * FILTER TYPES
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}