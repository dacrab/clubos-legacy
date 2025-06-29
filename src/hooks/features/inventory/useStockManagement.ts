"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Database } from "@/types/supabase";
import { STOCK_MESSAGES, CODE_MESSAGES } from "@/lib/constants";

const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function useStockManagement() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateStock = async (codeId: string, newStock: number): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('codes')
        .update({ stock: newStock })
        .eq('id', codeId);

      if (error) throw error;

      toast.success(STOCK_MESSAGES.UPDATE_SUCCESS);
      router.refresh();
      return true;
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error(CODE_MESSAGES.GENERIC_ERROR);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, updateStock };
} 