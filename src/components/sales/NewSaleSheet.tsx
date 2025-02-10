'use client';

import { useState } from 'react';
import { SalesPanel } from './SalesPanel';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

export function NewSaleSheet() {
  const [isOpen, setIsOpen] = useState(false);

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('name');
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