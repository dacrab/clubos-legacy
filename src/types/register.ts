// Re-export from focused type files

export type { DateRange, Json, TimeRange } from './common';
// Import and re-export Order type directly to avoid circular imports
export type {
  Order,
  OrderItem,
  Product,
  ProductSummary,
  RegisterClosing,
  RegisterSession,
  RegisterSessionWithClosings,
} from './database';
export type { Sale, SalesStats } from './sales';
export type { User, UserDisplay, UserRole } from './user';

// Local type definitions
export type PaymentMethodType = 'cash' | 'card' | 'treat';

// Additional register-specific types
export type OrderSummary = {
  total: number;
  discount_applied: boolean;
};

// Define SalesCode type locally to avoid circular imports
export type SalesCode = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: string;
  category_id: string | null;
};

export type CartItem = {
  id: string;
  code: SalesCode;
  codeId: string;
  quantity: number;
  isTreat: boolean;
  dosageCount?: number;
};

export type NewOrderItem = {
  product: SalesCode | null;
  quantity: number;
  isTreat: boolean;
  paymentMethod: PaymentMethodType;
};

export type OrderItemUpdate = {
  quantity: number;
  product_id: string;
  is_treat: boolean;
};

export type OrderWithSales = {
  id: string;
  session_id: string;
  created_at: string;
  created_by: string;
  payment_method: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  card_discounts_applied: number;
  sales?: {
    id: string;
    order_id: string;
    code_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    is_treat: boolean;
    payment_method: string;
    sold_by: string;
    created_at: string;
    is_deleted: boolean;
    is_edited: boolean;
    original_code: string | null;
    original_quantity: number | null;
  }[];
};

export type OrderItemWithProduct = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  is_treat: boolean;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string | null;
  is_edited: boolean;
  original_quantity: number | null;
  original_code: string | null;
  product: {
    name: string;
    price: number;
    image_url?: string | null;
    category?: {
      id: string;
      name: string;
    };
  };
};

export type RegisterSessionWithDetails = {
  id: string;
  opened_at: string;
  opened_by: string;
  closed_at: string | null;
  closed_by: string | null;
  notes: string | null;
  initial_cash: number;
  final_cash: number;
  total_sales: number;
  total_discounts: number;
  created_at: string;
  updated_at: string | null;
  register_closings: {
    id: string;
    session_id: string;
    cash_sales_count: number;
    cash_sales_total: number;
    card_sales_count: number;
    card_sales_total: number;
    treat_count: number;
    treat_total: number;
    total_discounts: number;
    notes: string | null;
    created_at: string;
  }[];
  orders: OrderWithSales[];
};

// Define ListItem type locally to avoid circular imports
export type ListItem = {
  id: string;
  type: 'active' | 'closing' | 'closed';
  session: RegisterSessionWithDetails;
  closing?: {
    id: string;
    session_id: string;
    closed_at: string;
    closed_by: string;
    final_cash: number;
    total_sales: number;
    total_discounts: number;
    notes: string | null;
    created_at: string;
    cash_sales_count: number;
    cash_sales_total: number;
    card_sales_count: number;
    card_sales_total: number;
    treat_count: number;
    treat_total: number;
  };
};

// Implement calculateStats function
export function calculateStats(items: ListItem[]): {
  totalSessions: number;
  activeSessions: number;
  closedSessions: number;
  totalRevenue: number;
  totalCashSales: number;
  totalCardSales: number;
  totalTreats: number;
  totalDiscounts: number;
} {
  const stats = {
    totalSessions: items.length,
    activeSessions: 0,
    closedSessions: 0,
    totalRevenue: 0,
    totalCashSales: 0,
    totalCardSales: 0,
    totalTreats: 0,
    totalDiscounts: 0,
  };

  for (const item of items) {
    if (item.type === 'active') {
      stats.activeSessions++;
    } else if (item.type === 'closed' || item.type === 'closing') {
      stats.closedSessions++;

      if (item.closing) {
        stats.totalCashSales += item.closing.cash_sales_total;
        stats.totalCardSales += item.closing.card_sales_total;
        stats.totalTreats += item.closing.treat_count;
        stats.totalDiscounts += item.closing.total_discounts;
      }
    }
  }

  stats.totalRevenue = stats.totalCashSales + stats.totalCardSales;

  return stats;
}
