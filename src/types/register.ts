import type { Database } from './supabase';
import type { Json } from './database';
import { CARD_DISCOUNT } from "@/lib/constants";

// Import types from other modules
import type { 
  Sale as SalesTypeSale, 
  Order as SalesOrder 
} from './sales';

// Re-export the Sale type for convenience
export type Sale = SalesTypeSale;

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

export interface ProductSummary extends Product {
  total: number;
  discount_applied: boolean;
}

/**
 * ORDER RELATED TYPES
 */
// Re-export Order type to avoid duplication
export interface Order extends SalesOrder {}

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
  closed_by_name: string;
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

/**
 * FILTER TYPES
 */
export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * UTILITY FUNCTIONS
 */

/**
 * Transform orders for display
 */
export const transformOrders = (orders: Order[]): Order[] => orders.map(order => ({
  ...order,
  sales: order.sales?.map(sale => ({
    ...sale,
    code: sale.code
  }))
}));

/**
 * Calculate statistics for session items
 */
export const calculateStats = (sessions: ListItem[]): SessionStats => sessions.reduce((acc, session) => {
  if (session.type === 'closed') {
    acc.treatsCount += session.treats_count;
    acc.cardCount += session.card_count;
    
    if (session.orders) {
      session.orders.forEach(order => {
        const isCardPayment = order.card_discount_count > 0;
        if (isCardPayment) {
          acc.totalCard += order.final_amount;
        } else {
          acc.totalCash += order.final_amount;
        }
      });
    }
  } else if (session.orders) {
    session.orders.forEach(order => {
      const isCardPayment = order.card_discount_count > 0;
      if (isCardPayment) {
        acc.totalCard += order.final_amount;
        acc.cardCount += order.card_discount_count;
      } else {
        acc.totalCash += order.final_amount;
      }
      
      order.sales?.forEach(sale => {
        if (sale.is_treat) {
          acc.treatsCount++;
        }
      });
    });
  }
  return acc;
}, {
  totalCash: 0,
  totalCard: 0,
  treatsCount: 0,
  cardCount: 0
});

/**
 * Calculate totals for active sessions
 */
export const calculateActiveSessionTotals = (orders?: Order[]): ActiveSessionTotals => {
  if (!orders) return {
    totalBeforeDiscounts: 0,
    cardDiscounts: 0,
    treats: 0,
    treatsAmount: 0
  };

  return orders.reduce((acc, order) => {
    order.sales?.forEach(sale => {
      // Skip deleted sales
      if (sale.is_deleted) return;
      
      if (sale.is_treat) {
        acc.treats += sale.quantity;
        acc.treatsAmount += sale.unit_price * sale.quantity;
      } else {
        acc.totalBeforeDiscounts += sale.total_price;
      }
    });

    acc.cardDiscounts += order.card_discount_count;

    return acc;
  }, {
    totalBeforeDiscounts: 0,
    cardDiscounts: 0,
    treats: 0,
    treatsAmount: 0
  });
};

/**
 * Calculate final amount after discounts
 */
export const calculateFinalAmount = (subtotal: number, cardDiscountCount: number): number => {
  const cardDiscount = cardDiscountCount * CARD_DISCOUNT;
  return Math.max(0, subtotal - cardDiscount);
};

/**
 * Transform database session to application format
 * Handles circular references and data normalization
 */
export const transformSession = (session: DatabaseRegisterSession): RegisterSessionWithClosings => {
  // Create a clean base object without circular references
  const baseSession: RegisterSessionWithClosings = {
    id: session.id,
    opened_at: session.opened_at,
    opened_by: '', // This will be filled later if needed
    closed_at: session.closed_at,
    closed_by: null,
    closed_by_name: session.closed_by_name,
    notes: session.notes || {},
    created_at: session.opened_at,
    register_closings: session.register_closings || [],
    orders: []
  };

  // Process orders if they exist
  if (session.orders && Array.isArray(session.orders)) {
    baseSession.orders = session.orders.map(order => {
      // Basic order data without circular references
      const processedOrder: Order = {
        id: order.id,
        register_session_id: session.id,
        total_amount: order.total_amount,
        final_amount: order.final_amount,
        card_discount_count: order.card_discount_count,
        created_by: '',
        created_at: session.opened_at,
        sales: []
      };

      // Process sales if they exist
      if (order.sales && Array.isArray(order.sales)) {
        processedOrder.sales = order.sales
          .filter(sale => sale !== null)
          .map(sale => {
            const code = sale.codes ? {
              id: sale.codes.id || '',
              name: sale.codes.name || '',
              price: sale.codes.price || 0,
              categories: sale.codes.categories || []
            } : null;

            // Create a sale object with all required properties
            // We need to cast to unknown first as the error suggests
            // IMPORTANT: Not setting the 'order' property to avoid circular references
            return {
              id: sale.id,
              code_id: code?.id || '',
              quantity: sale.quantity,
              unit_price: sale.unit_price,
              total_price: sale.total_price,
              payment_method: 'cash', // Default
              is_treat: !!sale.is_treat,
              code: code,
              is_edited: !!sale.is_edited,
              is_deleted: !!sale.is_deleted,
              original_code: sale.original_code,
              original_quantity: sale.original_quantity,
              // Add missing required properties
              order_id: order.id,
              created_at: session.opened_at,
              // Remove the circular reference to the order
              // order: processedOrder  <- This was causing the circular reference
            } as unknown as Sale;
          });
      }

      return processedOrder;
    });
  }

  return baseSession;
};