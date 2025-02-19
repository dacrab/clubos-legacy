import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './supabase'

export type TypedSupabaseClient = SupabaseClient<Database>

export interface Profile {
  id: string
  role: 'admin' | 'staff' | 'secretary'
  name: string
}

export interface Register {
  id: string
  items_sold: number
  coupons_used: number
  treat_items_sold: number
  total_amount: number
  closed_at: string | null
}

export interface Product {
  id: string
  name: string
  is_deleted: boolean
}

export interface SaleItem {
  id: string
  quantity: number
  price_at_sale: number
  products: Product
  is_treat: boolean
  last_edited_by: string | null
  last_edited_at: string | null
  is_deleted: boolean
  deleted_by: string | null
  deleted_at: string | null
  created_at: string
}

export interface Sale {
  id: string
  created_at: string
  total_amount: number
  coupon_applied: boolean
  coupons_used: number
  profile: {
    name: string
  }
  sale_items: SaleItem[]
} 