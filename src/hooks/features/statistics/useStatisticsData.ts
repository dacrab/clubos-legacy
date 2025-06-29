import { useState, useMemo, useEffect, useCallback } from 'react';
import { createClientSupabase } from '@/lib/supabase/client';
import { SaleWithDetails, Category } from '@/types/sales';
import { filterSalesByDateRange } from '@/lib/utils/chart-utils';
import { toast } from 'sonner';
import { API_ERROR_MESSAGES } from '@/lib/constants';

interface UseStatisticsDataReturn {
  dateRange: { startDate: string; endDate: string; } | null;
  setDateRange: React.Dispatch<React.SetStateAction<{ startDate: string; endDate: string; } | null>>;
  filteredSales: SaleWithDetails[];
  categories: Category[];
  subCategories: Record<string, Category[]>;
  loading: boolean;
}

export function useStatisticsData(initialSales: SaleWithDetails[]): UseStatisticsDataReturn {
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string; } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Record<string, Category[]>>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClientSupabase();

  const filteredSales = useMemo(() => {
    return filterSalesByDateRange(initialSales, dateRange);
  }, [initialSales, dateRange]);

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
        setLoading(false);
        return;
      }

      const mainCategories = data.filter(cat => !cat.parent_id);
      const subCategoriesMap = data.reduce((acc, cat) => {
        if (cat.parent_id) {
          if (!acc[cat.parent_id]) acc[cat.parent_id] = [];
          acc[cat.parent_id].push(cat);
        }
        return acc;
      }, {} as Record<string, Category[]>);

      setCategories(mainCategories);
      setSubCategories(subCategoriesMap);
      setLoading(false);
    }

    fetchCategories();
  }, [supabase]);

  return {
    dateRange,
    setDateRange,
    filteredSales,
    categories,
    subCategories,
    loading
  };
} 