import type { SupabaseClient } from '@supabase/supabase-js';
import { UNLIMITED_STOCK } from '@/lib/constants';
import type { ProductWithCategory } from '@/types/database';
import type { Database } from '@/types/supabase';

export function getProductsQuery(
  supabase: SupabaseClient<Database>,
  { onlyAvailableForNonAdmin = true }: { onlyAvailableForNonAdmin?: boolean } = {}
) {
  let query = supabase.from('products').select(
    `
      *,
      category:categories (
        *,
        parent:categories (
          id,
          name,
          description
        )
      )
    `
  );

  if (onlyAvailableForNonAdmin) {
    query = query.or(`stock_quantity.gt.0,stock_quantity.eq.${UNLIMITED_STOCK}`);
  }

  return query.order('name', { ascending: true });
}

export async function fetchProductsForUI(
  supabase: SupabaseClient<Database>,
  { isAdmin = false }: { isAdmin?: boolean } = {}
): Promise<ProductWithCategory[]> {
  const { data, error } = await getProductsQuery(supabase, {
    onlyAvailableForNonAdmin: !isAdmin,
  });
  if (error) {
    throw error;
  }
  return (data as unknown as ProductWithCategory[]) || [];
}
