// Basic JSON type used throughout database
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Raw types from database queries
export interface RawSaleItem {
  id: string
  quantity: number
  price_at_sale: number
  is_treat: boolean
  last_edited_by: string | null
  last_edited_at: string | null
  is_deleted: boolean
  deleted_by: string | null
  deleted_at: string | null
  product_id: string
  product: {
    id: string
    name: string
    price: number
    is_deleted: boolean
  } | null
}

export interface RawSale {
  id: string
  total_amount: number
  created_at: string
  sale_items: RawSaleItem[]
}

export interface RawRegister {
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
  sales: RawSale[]
}

export interface SupabaseSaleItem {
  id: string
  sale_id: string
  quantity: number
  price_at_sale: number
  is_treat: boolean
  last_edited_by: string | null
  last_edited_at: string | null
  is_deleted: boolean
  deleted_by: string | null
  deleted_at: string | null
  product_id: string
  created_at: string
  product?: {
    id: string
    name: string
    price: number
    is_deleted: boolean
  } | null
}

export interface RawSupabaseResponse {
  id: string
  created_at: string
  total_amount: number
  coupon_applied: boolean
  coupons_used: number
  registers: {
    id: string
    coupons_used: number
    opened_at: string
    closed_at: string | null
    closed_by_name: string | null
  }[]
  sale_items: SupabaseSaleItem[]
  profiles: {
    id: string
    name: string
    email: string
  }[]
}

// Database schema types
export interface Database {
  public: {
    Tables: {
      // Products table
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          price: number
          stock: number
          category: string
          subcategory: string | null
          image_url: string | null
          is_treat: boolean
          is_deleted: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          price: number
          stock: number
          category: string
          subcategory?: string | null
          image_url?: string | null
          is_treat?: boolean
          is_deleted?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          price?: number
          stock?: number
          category?: string
          subcategory?: string | null
          image_url?: string | null
          is_treat?: boolean
          is_deleted?: boolean
        }
      }
      // Sales table
      sales: {
        Row: {
          id: string
          created_at: string
          total: number
          items: Json[]
          coupon_applied: boolean
          register_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          total: number
          items: Json[]
          coupon_applied?: boolean
          register_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          total?: number
          items?: Json[]
          coupon_applied?: boolean
          register_id?: string | null
        }
      }
      // Registers table
      registers: {
        Row: {
          id: string
          created_at: string
          closed_at: string | null
          total: number
          items_count: number
          coupons_count: number
          treats_count: number
        }
        Insert: {
          id?: string
          created_at?: string
          closed_at?: string | null
          total: number
          items_count: number
          coupons_count: number
          treats_count: number
        }
        Update: {
          id?: string
          created_at?: string
          closed_at?: string | null
          total?: number
          items_count?: number
          coupons_count?: number
          treats_count?: number
        }
      }
      // Appointments table
      appointments: {
        Row: {
          id: string
          created_at: string
          start_time: string
          end_time: string
          title: string
          description: string | null
          type: 'football' | 'party'
          status: 'pending' | 'confirmed' | 'cancelled'
        }
        Insert: {
          id?: string
          created_at?: string
          start_time: string
          end_time: string
          title: string
          description?: string | null
          type: 'football' | 'party'
          status?: 'pending' | 'confirmed' | 'cancelled'
        }
        Update: {
          id?: string
          created_at?: string
          start_time?: string
          end_time?: string
          title?: string
          description?: string | null
          type?: 'football' | 'party'
          status?: 'pending' | 'confirmed' | 'cancelled'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
