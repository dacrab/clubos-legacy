"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClientSupabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { Category, GroupedCategory } from '@/types/products';
import { API_ERROR_MESSAGES } from '@/lib/constants';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [groupedCategories, setGroupedCategories] = useState<GroupedCategory[]>([]);
  const [subCategories, setSubCategories] = useState<Record<string, Category[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientSupabase();

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id, name, description, created_at, parent_id, created_by,
          parent:parent_id (id, name, description, created_at, parent_id, created_by)
        `)
        .order('name');

      if (error) throw error;
      if (!data) throw new Error('No data received for categories');

      const typedCategories = data.map(cat => ({
        ...cat,
        parent: cat.parent && !Array.isArray(cat.parent) ? cat.parent : null
      })) as Category[];

      const mainCategories = typedCategories.filter(cat => !cat.parent_id);
      
      const subCategoriesMap = typedCategories.reduce((acc: Record<string, Category[]>, cat) => {
        if (cat.parent_id) {
          acc[cat.parent_id] = [...(acc[cat.parent_id] || []), cat];
        }
        return acc;
      }, {});

      const grouped: GroupedCategory[] = mainCategories.map(main => ({
        main,
        subcategories: subCategoriesMap[main.id] || []
      }));

      setCategories(typedCategories);
      setGroupedCategories(grouped);
      setSubCategories(subCategoriesMap);

    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(API_ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, groupedCategories, subCategories, isLoading, refetch: fetchCategories };
} 