import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

import type { Category } from '@/types/products';
import type { NewSale } from '@/types/sales';
import { useUser } from '@/lib/auth-client';

import { useRegisterSessions } from '../register/useRegisterSessions';

// Using API calls for all data operations

type CategoriesMap = { [key: string]: Category[] };

export function useSales() {
  const [isCreating, setIsCreating] = useState(false);
  const { sessions, fetchSessions: mutateSession } = useRegisterSessions();
  const session = sessions?.find(s => !s.closed_at);

  // Fetch products via API
  const {
    data: products,
    isLoading: isProductsLoading,
    mutate: mutateProducts,
  } = useSWR('products', async () => {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    return await response.json();
  });

  const { data: categories, isLoading: isCategoriesLoading } = useSWR('categories', async () => {
    const response = await fetch('/api/categories');
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return await response.json();
  });

  const categoriesMap = useMemo(() => {
    if (!categories) {
      return {};
    }
    return categories.reduce((acc: CategoriesMap, category: Category) => {
      if (category.parentId) {
        if (!acc[category.parentId]) {
          acc[category.parentId] = [];
        }
        if (!acc[category.parentId].some(c => c.id === category.id)) {
          acc[category.parentId].push(category);
        }
      }
      return acc;
    }, {});
  }, [categories]);

  const user = useUser();

  const createSale = useCallback(
    async (newSale: NewSale) => {
      setIsCreating(true);
      try {
        if (!user) {
          throw new Error('User not authenticated');
        }
        if (!session?.id) {
          throw new Error('No active register session found');
        }

        // Create sale via API
        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...newSale, userId: user.id, sessionId: session.id }),
        });
        if (!response.ok) {
          throw new Error('Failed to create sale');
        }

        toast.success('Sale created successfully');
        mutateProducts();
        mutateSession();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        toast.error(`Error creating sale: ${message}`);
      } finally {
        setIsCreating(false);
      }
    },
    [session, mutateProducts, mutateSession, user]
  );

  return {
    products: products || [],
    categories: categories || [],
    categoriesMap,
    isLoading: isProductsLoading || isCategoriesLoading,
    createSale,
    isCreating,
  };
}
