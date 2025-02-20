import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './supabase'

// Client type
export type TypedSupabaseClient = SupabaseClient<Database>

// Common types
export type ID = string
export type Timestamp = string
export type Role = 'admin' | 'staff' | 'secretary'

// Request/Response types
export type SearchParamsValue = Record<string, string | string[] | undefined>

export type NextPageProps<T = Record<string, unknown>> = {
  params: Promise<T>
  searchParams?: Promise<SearchParamsValue>
}

// Entity interfaces
export interface BaseEntity {
  id: ID
  created_at?: Timestamp
  updated_at?: Timestamp
}

export interface Profile extends BaseEntity {
  role: Role
  name: string
}

export interface Register extends BaseEntity {
  items_sold: number
  coupons_used: number
  treat_items_sold: number
  total_amount: number
  closed_at: Timestamp | null
}

export interface Product extends BaseEntity {
  name: string
  price: number
  is_deleted: boolean
}

export interface SaleItem extends BaseEntity {
  quantity: number
  price_at_sale: number
  products: Product
  is_treat: boolean
  created_at: Timestamp
  last_edited_by: ID | null
  last_edited_at: Timestamp | null
  is_deleted: boolean
  deleted_by: ID | null
  deleted_at: Timestamp | null
}

export interface Sale extends BaseEntity {
  created_at: Timestamp
  total_amount: number
  coupon_applied: boolean
  coupons_used: number
  profile: {
    id: ID
    name: string
    email: string
  }
  register: {
    id: ID
    coupons_used: number
    opened_at: Timestamp
    closed_at: Timestamp | null
    closed_by_name: string | null
  }
  sale_items: SaleItem[]
}