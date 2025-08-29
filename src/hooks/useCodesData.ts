import { useCallback, useMemo } from 'react';
import useSWR from 'swr';

import { UNLIMITED_STOCK } from '@/lib/constants';
import { createClientSupabase } from "@/lib/supabase";
import type { Code } from "@/types/sales";

interface CategoriesMap {
  [key: string]: Array<{ id: string; name: string; description?: string; parent_id?: string | null }>;
}

interface CodeFilters {
  categoryId?: string;
  subcategoryId?: string;
  searchQuery?: string;
  inStock?: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
}

// Fetch codes from the database
const fetchCodes = async (): Promise<{ codes: Code[], categoriesMap: CategoriesMap }> => {
  const supabase = createClientSupabase() as any;
  
  try {
    // Fetch both codes and categories in parallel
    const [{ data: codesData, error: codesError }, { data: categoriesData, error: categoriesError }] = 
      await Promise.all([
        supabase
          .from('codes')
          .select(`*, category:categories!codes_category_id_fkey (*)`)
          .order('name'),
        supabase
          .from('categories')
          .select('*')
          .order('name')
      ]);

    if (codesError) {
      console.error('Error fetching codes:', codesError);
      throw new Error(codesError.message);
    }
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw new Error(categoriesError.message);
    }

    // Process categories into parent/child relationships
    const categoriesMap = (categoriesData || []).reduce((acc: CategoriesMap, category: Category) => {
      if (category.parent_id) {
        (acc[category.parent_id] = acc[category.parent_id] ?? []).push(category);
      }
      return acc;
    }, {});

    return {
      codes: codesData || [],
      categoriesMap
    };
  } catch (error) {
    console.error('Error in fetchCodes:', error);
    throw error;
  }
};

export function useCodesData(filters?: CodeFilters) {
  // Fetch data with SWR
  const { 
    data, 
    error, 
    isLoading, 
    mutate 
  } = useSWR('codes', fetchCodes, {
    revalidateOnFocus: false,
    refreshInterval: 60000, // Refresh every minute
    dedupingInterval: 10000, // Prevent frequent refetches
  });
  
  // Extract and memoize categories array
  const categories = useMemo(() => {
    if (!data?.codes) {return [];}
    
    return Array.from(new Set(
      data.codes
        .filter(code => code.category && !code.category.parent_id)
        .map(code => code.category!.name)
    ));
  }, [data?.codes]);
  
  // Apply filters to codes
  const filteredCodes = useMemo(() => {
    if (!data?.codes) {return [];}
    
    let filtered = data.codes;
    
    // Apply in-stock filter
    if (filters?.inStock) {
      filtered = filtered.filter(code => 
        code.stock > 0 || code.stock === UNLIMITED_STOCK
      );
    }
    
    // Apply search filter
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(code => 
        code.name.toLowerCase().includes(query) ||
        (code.category?.name || '').toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (filters?.categoryId) {
      const subcategories = data.categoriesMap[filters.categoryId];
      const subcategoryIds = subcategories.map(subcat => subcat.id);
      
      filtered = filtered.filter(code => 
        code.category_id === filters.categoryId || 
        subcategoryIds.includes(code.category_id || '')
      );
    }
    
    // Apply subcategory filter
    if (filters?.subcategoryId) {
      filtered = filtered.filter(code => 
        code.category_id === filters.subcategoryId
      );
    }
    
    return filtered;
  }, [
    data?.codes, 
    data?.categoriesMap, 
    filters?.inStock, 
    filters?.searchQuery, 
    filters?.categoryId, 
    filters?.subcategoryId
  ]);
  
  // Function to refresh data
  const refreshData = useCallback(() => {
    void mutate();
  }, [mutate]);
  
  return {
    codes: data?.codes || [],
    filteredCodes,
    categories,
    categoriesMap: data?.categoriesMap || {},
    isLoading,
    error,
    refreshData,
  };
} 