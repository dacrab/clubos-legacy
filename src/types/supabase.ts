export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
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
