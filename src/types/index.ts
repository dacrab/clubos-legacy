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
  category_id: string | null
  subcategory_id: string | null
  last_edited_by?: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  category?: {
    id: string
    name: string
  } | null
  subcategory?: {
    id: string
    name: string
  } | null
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
  opened_at: string
  closed_at: string | null
  items_sold: number
  coupons_used: number
  treat_items_sold: number
  total_amount: number
  closed_by: string | null
  created_at: string
  updated_at: string
  closed_by_name: string | null
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
      last_edited_by?: string
      last_edited_at?: string
      is_deleted?: boolean
      deleted_by?: string
      deleted_at?: string
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
    id: string
    name: string
    email: string
  }
  register: {
    id: string
    coupons_used: number
    opened_at: string
    closed_at: string | null
    closed_by_name: string | null
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
  last_edited_by?: string
  last_edited_at?: string
  is_deleted?: boolean
  deleted_by?: string
  deleted_at?: string
  products: {
    id: string
    name: string
    price: number
    is_deleted: boolean
  }
}

export interface DashboardStats {
  recentSales: Sale[]
  lowStockProducts: Product[]
} 