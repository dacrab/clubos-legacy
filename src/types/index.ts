export type Role = "admin" | "staff" | "secretary"

export interface Profile {
  id: string
  email: string
  name: string
  role: Role
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  is_treat: boolean
  image_url: string | null
  category: string
  subcategory: string | null
  last_edited_by?: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  total: number
  coupon_used: boolean
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  is_treat: boolean
  created_at: string
  updated_at: string
}

export interface Register {
  id: string
  user_id: string
  items_sold: number
  coupons_used: number
  treat_items_sold: number
  total_amount: number
  closed_at: string | null
  closed_by: string | null
  closed_by_name: string | null
  created_at: string
  updated_at: string
  profiles?: {
    name: string
  }
  sales?: {
    id: string
    total_amount: number
    sale_items?: {
      id: string
      quantity: number
      price_at_sale: number
      is_treat: boolean
      products: {
        name: string
      }
    }[]
  }[]
}

export interface Appointment {
  id: string
  type: 'football' | 'party'
  start_time: string
  end_time: string
  customer_name: string
  customer_phone: string
  notes?: string
  guests?: number
  created_by: string
  created_at: string
  updated_at: string
}

export interface Sale {
  id: string
  register_id: string
  total_amount: number
  coupon_applied: boolean
  coupons_used: number
  created_by: string
  created_at: string
  updated_at: string
  profile: {
    name: string
  }
  sale_items: SaleItem[]
}

export interface SaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  price_at_sale: number
  is_treat: boolean
  created_at: string
  products: {
    name: string
    last_edited_by?: string
    is_deleted?: boolean
  }
}

export interface DashboardStats {
  recentSales: Sale[]
  lowStockProducts: Product[]
} 