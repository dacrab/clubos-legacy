import { createBrowserClient } from '@supabase/ssr';
import { Database, Tables } from "@/types/supabase";
import { Sale as SaleType } from "@/types/sales";

// Define common types
export type { Tables };

// Re-export the main Sale type from the dedicated module
export type { Sale } from "@/types/sales";

// Re-export specific table types for convenience
export type Category = Tables<'categories'>;
export type Product = Tables<'codes'>;
export type User = Tables<'users'>;

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
export function isSale(value: any): value is Tables<'sales'> {
  return (
    value &&
    typeof value === 'object' &&
    'id' in value &&
    'code_id' in value &&
    'quantity' in value &&
    'total_price' in value &&
    'order_id' in value 
  );
}

// Type guard for checking if a value is a Code/Product
export function isCode(value: any): value is Product {
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