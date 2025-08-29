import { createBrowserClient } from '@supabase/ssr';

import { type Sale as SaleType } from "@/types/sales";
import { type Database } from "@/types/supabase";

// Define common types
export type Tables = Database['public']['Tables']

export type Sale = SaleType;

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  created_by: string;
  parent_id: string | null;
  parent?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

export interface Code extends Omit<Tables['codes']['Row'], 'category'> {
  id: string;
  name: string;
  price: number;
  stock: number;
  category_id: string | null;
  image_url: string | null;
  created_at: string;
  created_by: string;
  updated_at: string | null;
  category?: Category;
}

export type User = Tables['users']['Row'];

// Create Supabase client for browser
export function createClientSupabase() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Create Supabase client
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Supabase Image Loader for Next.js
export function supabaseImageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${src}?width=${width}&quality=${quality || 75}`
}

// Default export for Next.js image loader
export default supabaseImageLoader;

// Type guard for checking if a value is a Sale
export function isSale(value: any): value is Sale {
  return (
    value &&
    typeof value === 'object' &&
    'id' in value &&
    'code_id' in value &&
    'quantity' in value &&
    'total_price' in value &&
    'payment_method' in value &&
    (value.payment_method === 'cash' || value.payment_method === 'card' || value.payment_method === 'treat') &&
    'code' in value &&
    typeof value.code === 'object' &&
    value.code !== null &&
    'name' in value.code &&
    'price' in value.code
  );
}

// Type guard for checking if a value is a Code
export function isCode(value: any): value is Code {
  return (
    value &&
    typeof value === 'object' &&
    'id' in value &&
    'name' in value &&
    'price' in value
  );
}

// Type guard for checking if a value is a Category
export function isCategory(value: any): value is Category {
  return (
    value &&
    typeof value === 'object' &&
    'id' in value &&
    'name' in value
  );
}