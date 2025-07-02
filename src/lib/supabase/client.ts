import { createBrowserClient } from '@supabase/ssr';
import { Database, Tables } from "@/types/supabase";
import { Sale as SaleType } from "@/types/sales";

// Define common types
export type { Tables };

// Re-export the main Sale type from the dedicated module
export type { Sale } from "@/types/sales";

// Re-export specific table types for convenience
export type Category = Tables<'categories'>;
export type Product = Tables<'products'>;
export type User = Tables<'users'>;
export type Order = Tables<'orders'>;

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

// Custom type guard to check if a sale has a populated product
export function saleHasProduct(sale: any): sale is Tables<'sales'> & { product: Product } {
  return sale.product && typeof sale.product === 'object' && 'id' in sale.product;
}

// Type guard for checking if a value is a Sale
export function isSale(value: any): value is Tables<'sales'> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'order_id' in value &&
    'product_id' in value &&
    'quantity' in value &&
    'unit_price' in value &&
    'total_price' in value &&
    'is_treat' in value
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