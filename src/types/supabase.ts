export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          contact_details: string
          created_at: string
          date_time: string
          id: string
          notes: string | null
          num_adults: number
          num_children: number
          user_id: string | null
          who_booked: string
        }
        Insert: {
          contact_details: string
          created_at?: string
          date_time: string
          id?: string
          notes?: string | null
          num_adults?: number
          num_children: number
          user_id?: string | null
          who_booked: string
        }
        Update: {
          contact_details?: string
          created_at?: string
          date_time?: string
          id?: string
          notes?: string | null
          num_adults?: number
          num_children?: number
          user_id?: string | null
          who_booked?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          parent_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          parent_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      codes: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string
          id: string
          image_url: string | null
          name: string
          price: number
          stock: number
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          image_url?: string | null
          name: string
          price: number
          stock?: number
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          stock?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "codes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      football_field_bookings: {
        Row: {
          booking_datetime: string
          contact_details: string
          created_at: string
          field_number: number
          id: string
          notes: string | null
          num_players: number
          user_id: string | null
          who_booked: string
        }
        Insert: {
          booking_datetime: string
          contact_details: string
          created_at?: string
          field_number: number
          id?: string
          notes?: string | null
          num_players: number
          user_id?: string | null
          who_booked: string
        }
        Update: {
          booking_datetime?: string
          contact_details?: string
          created_at?: string
          field_number?: number
          id?: string
          notes?: string | null
          num_players?: number
          user_id?: string | null
          who_booked?: string
        }
        Relationships: [
          {
            foreignKeyName: "football_field_bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          card_discount_count: number
          created_at: string
          created_by: string
          final_amount: number
          id: string
          register_session_id: string
          total_amount: number
        }
        Insert: {
          card_discount_count?: number
          created_at?: string
          created_by: string
          final_amount: number
          id?: string
          register_session_id: string
          total_amount: number
        }
        Update: {
          card_discount_count?: number
          created_at?: string
          created_by?: string
          final_amount?: number
          id?: string
          register_session_id?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_register_session_id_fkey"
            columns: ["register_session_id"]
            isOneToOne: false
            referencedRelation: "register_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      register_closings: {
        Row: {
          card_count: number
          closed_by_name: string | null
          created_at: string
          id: string
          notes: Json | null
          register_session_id: string
          treats_count: number
          treats_total: number
        }
        Insert: {
          card_count: number
          closed_by_name?: string | null
          created_at?: string
          id?: string
          notes?: Json | null
          register_session_id: string
          treats_count: number
          treats_total?: number
        }
        Update: {
          card_count?: number
          closed_by_name?: string | null
          created_at?: string
          id?: string
          notes?: Json | null
          register_session_id?: string
          treats_count?: number
          treats_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "register_closings_register_session_id_fkey"
            columns: ["register_session_id"]
            isOneToOne: true
            referencedRelation: "register_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      register_sessions: {
        Row: {
          closed_at: string | null
          closed_by_name: string | null
          id: string
          notes: Json | null
          opened_at: string
        }
        Insert: {
          closed_at?: string | null
          closed_by_name?: string | null
          id?: string
          notes?: Json | null
          opened_at?: string
        }
        Update: {
          closed_at?: string | null
          closed_by_name?: string | null
          id?: string
          notes?: Json | null
          opened_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          code_id: string
          created_at: string
          edited_at: string | null
          edited_by: string | null
          id: string
          is_deleted: boolean
          is_edited: boolean
          is_treat: boolean
          order_id: string
          original_code: string | null
          original_quantity: number | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          code_id: string
          created_at?: string
          edited_at?: string | null
          edited_by?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          is_treat?: boolean
          order_id: string
          original_code?: string | null
          original_quantity?: number | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          code_id?: string
          created_at?: string
          edited_at?: string | null
          edited_by?: string | null
          id?: string
          is_deleted?: boolean
          is_edited?: boolean
          is_treat?: boolean
          order_id?: string
          original_code?: string | null
          original_quantity?: number | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      close_register: {
        Args: {
          p_register_session_id: string
          p_closed_by_name: string
          p_notes?: Json
        }
        Returns: string
      }
    }
    Enums: {
      payment_method_type: "cash" | "card" | "treat"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      payment_method_type: ["cash", "card", "treat"],
    },
  },
} as const

