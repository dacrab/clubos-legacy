// ======= Common Types =======
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type DateRange = {
  startDate: string | null;
  endDate: string | null;
};

export type TimeRange = {
  startTime: string;
  endTime: string;
};

export type PaymentMethodType = 'cash' | 'card' | 'treat';
export type UserRole = 'admin' | 'staff' | 'secretary';

// ======= Database Row Types =======
export type Product = Database['public']['Tables']['products']['Row'] & {
  category?: Category;
};

export type Category = Database['public']['Tables']['categories']['Row'];

export type Order = Database['public']['Tables']['orders']['Row'];

export type OrderItem = Database['public']['Tables']['order_items']['Row'] & {
  product: {
    name: string;
    price: number;
    image_url?: string | null;
    category?: {
      id: string;
      name: string;
    };
  };
};

export type User = Database['public']['Tables']['users']['Row'];
export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type FootballBooking = Database['public']['Tables']['football_bookings']['Row'];
export type RegisterSession = Database['public']['Tables']['register_sessions']['Row'];

export type RegisterClosing = Database['public']['Tables']['register_closings']['Row'] & {
  closer?: {
    username: string;
  };
};

// ======= Database Schema =======
export type Database = {
  public: {
    Tables: {
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
          id: string;
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
      codes: {
        Row: {
          id: string;
          name: string;
          price: number;
          stock: number;
          image_url: string | null;
          created_at: string;
          updated_at: string | null;
          created_by: string;
          category_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          stock?: number;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
          created_by: string;
          category_id?: string | null;
          // Allow extra categories array used by UI; ignored by DB
          categories?: string[];
        };
        Update: {
          id?: string;
          name?: string;
          price?: number;
          stock?: number;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string | null;
          created_by?: string;
          category_id?: string | null;
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
      orders: {
        Row: {
          id: string;
          session_id: string; // renamed from register_session_id in migration
          subtotal: number; // renamed from total_amount
          discount_amount: number;
          total_amount: number; // renamed from final_amount
          card_discounts_applied: number; // renamed from card_discount_count
          payment_method: PaymentMethodType;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          subtotal: number;
          discount_amount?: number;
          total_amount: number;
          card_discounts_applied?: number;
          payment_method: PaymentMethodType;
          created_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          subtotal?: number;
          discount_amount?: number;
          total_amount?: number;
          card_discounts_applied?: number;
          payment_method?: PaymentMethodType;
          created_at?: string;
          created_by?: string;
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
      sales: {
        Row: {
          id: string;
          order_id: string;
          code_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          is_treat: boolean;
          payment_method: PaymentMethodType;
          sold_by: string;
          created_at: string;
          is_deleted?: boolean;
          is_edited?: boolean;
          original_code?: string | null;
          original_quantity?: number | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          code_id: string;
          quantity: number;
          unit_price: number;
          total_price: number;
          is_treat?: boolean;
          payment_method: PaymentMethodType;
          sold_by: string;
          created_at?: string;
          is_deleted?: boolean;
          is_edited?: boolean;
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
          payment_method?: PaymentMethodType;
          sold_by?: string;
          created_at?: string;
          is_deleted?: boolean;
          is_edited?: boolean;
          original_code?: string | null;
          original_quantity?: number | null;
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
    };
    Functions: {
      has_permission: {
        Args: {
          p_permission: string;
        };
        Returns: boolean;
      };
      close_register_session: {
        Args: {
          p_session_id: string;
          p_notes?: Json;
        };
        Returns: string;
      };
      decrement_stock: {
        Args: {
          p_code_id: string;
          p_quantity: number;
        };
        Returns: undefined;
      };
      increment_stock: {
        Args: {
          code_id: string;
          increment_value: number;
        };
        Returns: undefined;
      };
      update_user_details: {
        Args: {
          user_id: string;
          user_name: string;
          user_role: Database['public']['Enums']['user_role'];
        };
        Returns: undefined;
      };
    };
    Enums: {
      payment_method: 'cash' | 'card' | 'treat';
      user_role: 'admin' | 'staff' | 'secretary';
    };
    Views: {};
    CompositeTypes: {};
  };
};
