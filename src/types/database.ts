import { Database } from './supabase';

export type Sale = Database['public']['Tables']['sales']['Row'] & {
  coffee_options?: Json | null;
};

export type User = Database['public']['Tables']['users']['Row'];
export type Code = Database['public']['Tables']['codes']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type RegisterSession = Database['public']['Tables']['register_sessions']['Row'];
export type RegisterClosing = Database['public']['Tables']['register_closings']['Row'];

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]; 