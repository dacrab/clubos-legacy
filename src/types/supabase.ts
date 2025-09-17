export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string;
          customer_name: string;
          contact_info: string;
          appointment_date: string;
          num_children: number;
          num_adults: number;
          notes: string | null;
          status: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          contact_info: string;
          appointment_date: string;
          num_children: number;
          num_adults?: number;
          notes?: string | null;
          status?: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          contact_info?: string;
          appointment_date?: string;
          num_children?: number;
          num_adults?: number;
          notes?: string | null;
          status?: string;
          created_at?: string;
          created_by?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          parent_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string | null;
          created_by: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          parent_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string | null;
          created_by: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          parent_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string | null;
          created_by?: string;
        };
        Relationships: [];
      };
      football_bookings: {
        Row: {
          id: string;
          customer_name: string;
          contact_info: string;
          booking_datetime: string;
          field_number: number;
          num_players: number;
          notes: string | null;
          status: string;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          contact_info: string;
          booking_datetime: string;
          field_number: number;
          num_players: number;
          notes?: string | null;
          status?: string;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          contact_info?: string;
          booking_datetime?: string;
          field_number?: number;
          num_players?: number;
          notes?: string | null;
          status?: string;
          created_at?: string;
          created_by?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          session_id: string;
          created_at: string;
          created_by: string;
          payment_method: Database['public']['Enums']['payment_method'];
          subtotal: number;
          discount_amount: number;
          total_amount: number;
          card_discounts_applied: number;
        };
        Insert: {
          id?: string;
          session_id: string;
          created_at?: string;
          created_by: string;
          payment_method: Database['public']['Enums']['payment_method'];
          subtotal: number;
          discount_amount?: number;
          total_amount: number;
          card_discounts_applied?: number;
        };
        Update: {
          id?: string;
          session_id?: string;
          created_at?: string;
          created_by?: string;
          payment_method?: Database['public']['Enums']['payment_method'];
          subtotal?: number;
          discount_amount?: number;
          total_amount?: number;
          card_discounts_applied?: number;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
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
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          quantity: number;
          unit_price: number;
          line_total: number;
          is_treat?: boolean;
          is_deleted?: boolean;
          deleted_at?: string | null;
          deleted_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string;
          quantity?: number;
          unit_price?: number;
          line_total?: number;
          is_treat?: boolean;
          is_deleted?: boolean;
          deleted_at?: string | null;
          deleted_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          stock_quantity: number;
          category_id: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          stock_quantity?: number;
          category_id?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          stock_quantity?: number;
          category_id?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
        Relationships: [];
      };
      register_closings: {
        Row: {
          id: string;
          session_id: string;
          cash_sales_count: number;
          cash_sales_total: number;
          card_sales_count: number;
          card_sales_total: number;
          treat_count: number;
          treat_total: number;
          total_discounts: number;
          notes: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          cash_sales_count?: number;
          cash_sales_total?: number;
          card_sales_count?: number;
          card_sales_total?: number;
          treat_count?: number;
          treat_total?: number;
          total_discounts?: number;
          notes?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          cash_sales_count?: number;
          cash_sales_total?: number;
          card_sales_count?: number;
          card_sales_total?: number;
          treat_count?: number;
          treat_total?: number;
          total_discounts?: number;
          notes?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
      register_sessions: {
        Row: {
          id: string;
          opened_at: string;
          opened_by: string;
          closed_at: string | null;
          closed_by: string | null;
          notes: Json | null;
        };
        Insert: {
          id?: string;
          opened_at?: string;
          opened_by: string;
          closed_at?: string | null;
          closed_by?: string | null;
          notes?: Json | null;
        };
        Update: {
          id?: string;
          opened_at?: string;
          opened_by?: string;
          closed_at?: string | null;
          closed_by?: string | null;
          notes?: Json | null;
        };
        Relationships: [];
      };
      sales: {
        Row: {
          id: string;
          order_id: string;
          code_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          is_treat: boolean;
          payment_method: Database['public']['Enums']['payment_method'];
          sold_by: string;
          created_at: string;
          is_deleted: boolean | null;
          is_edited: boolean | null;
          original_code: string | null;
          original_quantity: number | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          code_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          is_treat?: boolean;
          payment_method: Database['public']['Enums']['payment_method'];
          sold_by: string;
          created_at?: string;
          is_deleted?: boolean | null;
          is_edited?: boolean | null;
          original_code?: string | null;
          original_quantity?: number | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          code_id?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          is_treat?: boolean;
          payment_method?: Database['public']['Enums']['payment_method'];
          sold_by?: string;
          created_at?: string;
          is_deleted?: boolean | null;
          is_edited?: boolean | null;
          original_code?: string | null;
          original_quantity?: number | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          username: string;
          role: Database['public']['Enums']['user_role'];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          role?: Database['public']['Enums']['user_role'];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          role?: Database['public']['Enums']['user_role'];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'admin' | 'staff' | 'secretary';
      payment_method: 'cash' | 'card' | 'treat';
    };
  };
};
