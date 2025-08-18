'use client';

import { useEffect, useState } from 'react';

import type { Category, GroupedCategory } from '@/types/products';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getGroupedCategories = async (): Promise<GroupedCategory[]> => {
    try {
      const response = await fetch('/api/categories?grouped=true');
      if (!response.ok) {
        throw new Error('Failed to fetch grouped categories');
      }
      return await response.json();
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        (await import('@/lib/utils/logger')).logger.error(
          'Error fetching grouped categories:',
          err
        );
      }
      return [];
    }
  };

  return {
    categories,
    loading,
    error,
    refetch,
    getGroupedCategories,
  };
};
