// ======= Product Types =======
export type Product = {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  category_id: string | null;
  created_at: string;
  created_by: string;
  updated_at: string | null;
};

export type ProductWithCategory = Product & {
  category?: Category | null;
};

// ======= Category Types =======
export type Category = {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string;
};

// ======= Order Types =======
export type Order = {
  id: string;
  session_id: string;
  created_at: string;
  created_by: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  coupon_count?: number;
  card_discounts_applied: number;
};

export type OrderItem = {
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
};

export type OrderItemWithProduct = OrderItem & {
  product: Product;
};

export type OrderWithItems = Order & {
  order_items: OrderItemWithProduct[];
};

// ======= Register Types =======
export type RegisterSession = {
  id: string;
  opened_at: string;
  opened_by: string;
  closed_at: string | null;
  closed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
};

export type RegisterClosing = {
  id: string;
  session_id: string;
  closed_at: string;
  closed_by: string;
  final_cash: number;
  total_sales: number;
  total_discounts: number;
  notes: string | null;
  created_at: string;
};
