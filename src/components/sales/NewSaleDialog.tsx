'use client';

import { useState } from 'react';
import { SalesPanel } from './SalesPanel';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@/types';

export function NewSaleDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: products } = useQuery<Product[]>({
    queryKey: ['available-products'],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:category_id(id, name),
          subcategory:subcategory_id(id, name)
        `)
        .eq('is_deleted', false)
        .or('stock.gt.0,stock.eq.-1') // Get products with stock > 0 OR stock = -1 (unlimited)
        .order('name');

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      return data;
    },
  });

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>New Sale</Button>
      <SalesPanel
        products={products || null}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
} 