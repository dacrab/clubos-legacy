"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";
import { createClientSupabase } from "@/lib/supabase/client";
import type { Product } from "@/types/products";
import { toast } from "sonner";

const supabase = createClientSupabase();

export function useStockManagement(product: Product) {
  const [stock, setStock] = useState(product.stock);
  const [isLoading, setIsLoading] = useState(false);
  const { cache } = useSWRConfig();
  const router = useRouter();

  const handleStockUpdate = async (newStock: number) => {
    setIsLoading(true);
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock })
      .eq('id', product.id);

    if (error) {
      toast.error('Αποτυχία ενημέρωσης αποθέματος.');
      console.error(error);
    } else {
      toast.success('Το απόθεμα ενημερώθηκε με επιτυχία.');
      cache.delete(`product:${product.id}`);
      cache.delete('products');
      router.refresh();
    }
    setIsLoading(false);
  };

  return { stock, setStock, isLoading, handleStockUpdate };
} 