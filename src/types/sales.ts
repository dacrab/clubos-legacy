// ======= Sale Types =======
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
  is_deleted: boolean | null;
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
