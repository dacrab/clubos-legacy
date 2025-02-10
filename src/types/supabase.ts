export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'staff' | 'secretary'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'admin' | 'staff' | 'secretary'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'staff' | 'secretary'
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          price: number
          stock: number
          is_treat: boolean
          last_edited_by: string | null
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          price: number
          stock?: number
          is_treat?: boolean
          last_edited_by?: string | null
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          price?: number
          stock?: number
          is_treat?: boolean
          last_edited_by?: string | null
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      registers: {
        Row: {
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
        }
        Insert: {
          id?: string
          opened_at?: string
          closed_at?: string | null
          items_sold?: number
          coupons_used?: number
          treat_items_sold?: number
          total_amount?: number
          closed_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          opened_at?: string
          closed_at?: string | null
          items_sold?: number
          coupons_used?: number
          treat_items_sold?: number
          total_amount?: number
          closed_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          register_id: string
          total_amount: number
          coupon_applied: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          register_id: string
          total_amount: number
          coupon_applied?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          register_id?: string
          total_amount?: number
          coupon_applied?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          product_id: string
          quantity: number
          price_at_sale: number
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          product_id: string
          quantity: number
          price_at_sale: number
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          product_id?: string
          quantity?: number
          price_at_sale?: number
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          type: 'football' | 'party'
          start_time: string
          end_time: string
          customer_name: string
          customer_phone: string
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: 'football' | 'party'
          start_time: string
          end_time: string
          customer_name: string
          customer_phone: string
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: 'football' | 'party'
          start_time?: string
          end_time?: string
          customer_name?: string
          customer_phone?: string
          notes?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
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
      user_role: 'admin' | 'staff' | 'secretary'
      appointment_type: 'football' | 'party'
    }
  }
} 