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
