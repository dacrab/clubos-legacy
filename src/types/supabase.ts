// ======= Common Types =======
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type DateRange = {
  startDate: string | null;
  endDate: string | null;
};

export type TimeRange = {
  startTime: string;
  endTime: string;
};

export type PaymentMethodType = 'cash' | 'card' | 'treat';

// ======= Database Row Types =======
export type Code = Database['public']['Tables']['codes']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'];
};

export type Category = Database['public']['Tables']['categories']['Row']

export type Sale = Database['public']['Tables']['sales']['Row'] & {
  code: {
    name: string;
    price: number;
    image_url?: string | null;
    category?: {
      id: string;
      name: string;
    }
  };
};

export type User = Database['public']['Tables']['users']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type FootballFieldBooking = Database['public']['Tables']['football_field_bookings']['Row']
export type RegisterSession = Database['public']['Tables']['register_sessions']['Row']

export type RegisterClosing = Database['public']['Tables']['register_closings']['Row'] & {
  closer?: {
    username: string;
  };
};

// ======= Database Schema =======
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          role: 'admin' | 'staff'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          role?: 'admin' | 'staff'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          role?: 'admin' | 'staff'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          parent_id: string | null
          created_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          parent_id?: string | null
          created_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          parent_id?: string | null
          created_at?: string
          created_by?: string
        }
      }
      codes: {
        Row: {
          id: string
          name: string
          price: number
          stock: number
          category_id: string | null
          image_url: string | null
          created_at: string
          created_by: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          price: number
          stock?: number
          category_id?: string | null
          image_url?: string | null
          created_at?: string
          created_by: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          price?: number
          stock?: number
          category_id?: string | null
          image_url?: string | null
          created_at?: string
          created_by?: string
          updated_at?: string | null
        }
      }
      sales: {
        Row: {
          id: string
          register_session_id: string
          code_id: string
          quantity: number
          unit_price: number
          total_price: number
          discount_amount: number
          final_price: number
          payment_method: PaymentMethodType
          is_treat: boolean
          coffee_options: Json | null
          sold_by: string
          created_at: string
          is_edited: boolean
          is_deleted: boolean
          original_quantity: number | null
          original_code: string | null
          edited_at: string | null
          edited_by: string | null
        }
        Insert: {
          id?: string
          register_session_id: string
          code_id: string
          quantity: number
          unit_price: number
          total_price: number
          discount_amount?: number
          final_price: number
          payment_method: PaymentMethodType
          is_treat?: boolean
          coffee_options?: Json | null
          sold_by: string
          created_at?: string
          is_edited?: boolean
          is_deleted?: boolean
          original_quantity?: number | null
          original_code?: string | null
          edited_at?: string | null
          edited_by?: string | null
        }
        Update: {
          id?: string
          register_session_id?: string
          code_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          discount_amount?: number
          final_price?: number
          payment_method?: PaymentMethodType
          is_treat?: boolean
          coffee_options?: Json | null
          sold_by?: string
          created_at?: string
          is_edited?: boolean
          is_deleted?: boolean
          original_quantity?: number | null
          original_code?: string | null
          edited_at?: string | null
          edited_by?: string | null
        }
      }
      register_sessions: {
        Row: {
          id: string
          opened_at: string
          opened_by: string
          closed_at: string | null
          closed_by: string | null
          initial_cash: number
          final_cash: number
          cash_payments_total: number
          card_payments_total: number
          treats_total: number
          notes: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          opened_at?: string
          opened_by: string
          closed_at?: string | null
          closed_by?: string | null
          initial_cash: number
          final_cash?: number
          cash_payments_total?: number
          card_payments_total?: number
          treats_total?: number
          notes?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          opened_at?: string
          opened_by?: string
          closed_at?: string | null
          closed_by?: string | null
          initial_cash?: number
          final_cash?: number
          cash_payments_total?: number
          card_payments_total?: number
          treats_total?: number
          notes?: Json | null
          created_at?: string
        }
      }
      register_closings: {
        Row: {
          id: string
          register_session_id: string
          closed_by: string
          cash_amount: number
          card_amount: number
          treats_total: number
          treats_count: number
          card_count: number
          notes: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          register_session_id: string
          closed_by: string
          cash_amount: number
          card_amount: number
          treats_total: number
          treats_count: number
          card_count: number
          notes?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          register_session_id?: string
          closed_by?: string
          cash_amount?: number
          card_amount?: number
          treats_total?: number
          treats_count?: number
          card_count?: number
          notes?: Json | null
          created_at?: string
        }
      }
      football_field_bookings: {
        Row: {
          id: string
          who_booked: string
          booking_datetime: string
          contact_details: string
          field_number: number
          num_players: number
          notes: string | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          who_booked: string
          booking_datetime: string
          contact_details: string
          field_number: number
          num_players: number
          notes?: string | null
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          who_booked?: string
          booking_datetime?: string
          contact_details?: string
          field_number?: number
          num_players?: number
          notes?: string | null
          user_id?: string
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          who_booked: string
          date_time: string
          contact_details: string
          num_children: number
          num_adults: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          who_booked: string
          date_time: string
          contact_details: string
          num_children: number
          num_adults: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          who_booked?: string
          date_time?: string
          contact_details?: string
          num_children?: number
          num_adults?: number
          notes?: string | null
          created_at?: string
        }
      }
    }
    Functions: {
      close_register: {
        Args: {
          p_register_session_id: string;
          p_notes?: Json;
        };
        Returns: string;
      }
    }
    Enums: {
      payment_method_type: 'cash' | 'card' | 'treat'
    }
  }
}