// ======= Sale Types =======
export type Sale = {
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
  code?: import('./database').SalesCode | null;
  order?: {
    id: string;
    card_discounts_applied: number;
  } | null;
};

export type SaleLike = {
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
  code?: {
    name: string;
    category?: {
      name: string;
    } | null;
  } | null;
  order?: {
    id: string;
    card_discounts_applied: number;
  } | null;
};

// ======= Sales Filter Types =======
export type SalesDateRange = {
  startDate: string;
  endDate: string;
};

export type SalesFilters = {
  dateRange?: SalesDateRange;
  timeRange?: import('./common').TimeRange;
  limit?: number;
  searchQuery?: string;
};

// ======= Chart & Analytics Types =======
export type ChartDataItem = {
  name: string;
  value: number;
  total: number;
  percentage?: string;
};

export type GroupedSale = {
  id: string;
  created_at: string;
  total: number;
  items: Sale[];
  treats_count: number;
  card_discount_count: number;
  final_amount: number;
  is_card_payment: boolean;
};

// ======= Statistics Types =======
export type SalesStats = {
  totalSales: number;
  cashSalesCount: number;
  cardSalesCount: number;
  treatCount: number;
  totalBeforeDiscounts: number;
  cardDiscountCount: number;
  cardDiscountAmount: number;
  treatsAmount: number;
  totalRevenue: number;
  cashRevenue: number;
  cardRevenue: number;
  averageOrderValue: number;
  uniqueCodes: number;
};

// ======= List Item Types =======
export type ListItem = {
  id: string;
  type: 'active' | 'closing' | 'closed';
  session: import('./register').RegisterSessionWithDetails;
  closing?: import('./database').RegisterClosing;
};
