import useSWR from 'swr';
import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { createClientSupabase } from '@/lib/supabase/client';
import type { OrderItem, NewSale } from '@/types/sales';
import { Product, Category } from '@/types/products';
import { useRegisterSessions } from '../register/useRegisterSessions';

const supabase = createClientSupabase();

type CategoriesMap = { [key: string]: Category[] };

export function useSales() {
  const [isCreating, setIsCreating] = useState(false);
  const { sessions, refreshData: mutateSession } = useRegisterSessions();
  const session = sessions?.find(s => !s.closed_at);
  
  const { data: products, error: productsError, isLoading: isProductsLoading, mutate: mutateProducts } = useSWR(
    'products', 
    async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`*, category:categories(*)`)
        .order('name');
      if (error) throw new Error(error.message);
      return data as Product[];
    }
  );
  
  const { data: categories, error: categoriesError, isLoading: isCategoriesLoading } = useSWR(
    'categories',
    async () => {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name');
        if (error) throw new Error(error.message);
        return data as Category[];
    }
  );
  
  const categoriesMap = useMemo(() => {
    if (!categories) return {};
    return categories.reduce((acc: CategoriesMap, category: Category) => {
      if (category.parent_id) {
        if (!acc[category.parent_id]) {
          acc[category.parent_id] = [];
        }
        if (!acc[category.parent_id].some(c => c.id === category.id)) {
          acc[category.parent_id].push(category);
        }
      }
      return acc;
    }, {});
  }, [categories]);

  const createSale = useCallback(async (newSale: NewSale) => {
    setIsCreating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      if (!session?.id) throw new Error('No active register session found');

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          register_session_id: session.id,
          total_amount: newSale.totalAmount,
          final_amount: newSale.finalAmount,
          card_discount_count: newSale.cardDiscountCount,
          created_by: user.id,
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      const saleItems = newSale.items.map((item: OrderItem) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
        is_treat: item.isTreat,
      }));

      const { error: salesError } = await supabase.from('sales').insert(saleItems);
      if (salesError) throw salesError;
      
      for (const item of newSale.items) {
        if (item.product.stock !== -1 && !item.isTreat) {
          const { error } = await supabase
            .from('products')
            .update({ stock: item.product.stock - item.quantity })
            .eq('id', item.product.id);
          if (error) console.warn(`Could not update stock for product ${item.product.id}: ${error.message}`);
        }
      }

      toast.success('Sale created successfully');
      mutateProducts();
      mutateSession();

    } catch (error: any) {
      toast.error(`Error creating sale: ${error.message}`);
    } finally {
      setIsCreating(false);
    }
  }, [session, mutateProducts, mutateSession]);

  return {
    products: products || [],
    categories: categories || [],
    categoriesMap,
    isLoading: isProductsLoading || isCategoriesLoading,
    createSale,
    isCreating,
  };
}