import type { SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  API_ERROR_MESSAGES,
  CARD_DISCOUNT,
  EXTRA_SHOT_PRICE,
  type PAYMENT_METHOD_LABELS,
  REGISTER_MESSAGES,
  SALES_MESSAGES,
} from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase';

type Code = Database['public']['Tables']['products']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'] | null;
};
type OrderItem = {
  id: string;
  code: Code;
  quantity: number;
  isTreat: boolean;
  dosageCount?: number;
};
type CategoriesMap = Record<string, Database['public']['Tables']['categories']['Row'][]>;

import { fetchProductsForUI } from '@/lib/utils/products';
import type { Database } from '@/types/supabase';

type CreateOrderParams = {
  supabase: SupabaseClient<Database>;
  registerSessionId: string;
  orderTotal: number;
  cardDiscountCount: number;
  paymentMethod: keyof typeof PAYMENT_METHOD_LABELS;
};

async function getUser(supabase: SupabaseClient<Database>) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error(SALES_MESSAGES.NO_USER_ERROR);
  }
  return user;
}

async function getActiveRegisterSession(supabase: SupabaseClient<Database>) {
  const { data: activeSession } = await supabase
    .from('register_sessions')
    .select('id')
    .is('closed_at', null)
    .single();
  return activeSession;
}

async function createNewRegisterSession(supabase: SupabaseClient<Database>) {
  const user = await getUser(supabase);
  const { data: newSession, error } = await supabase
    .from('register_sessions')
    .insert({ opened_by: user.id })
    .select('id')
    .single();

  if (error) {
    throw new Error(API_ERROR_MESSAGES.SERVER_ERROR);
  }
  toast.success(REGISTER_MESSAGES.SESSION_CREATED);
  return newSession;
}

async function createOrder({
  supabase,
  registerSessionId,
  orderTotal,
  cardDiscountCount,
  paymentMethod,
}: CreateOrderParams) {
  const user = await getUser(supabase);
  const finalAmount = Math.max(0, orderTotal - cardDiscountCount * CARD_DISCOUNT);

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      session_id: registerSessionId,
      subtotal: orderTotal,
      discount_amount: orderTotal - finalAmount,
      total_amount: finalAmount,
      card_discounts_applied: cardDiscountCount,
      payment_method: paymentMethod,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (orderError) {
    throw new Error(`${API_ERROR_MESSAGES.SERVER_ERROR}: ${orderError.message}`);
  }
  return orderData;
}

type ProcessSaleItemParams = {
  supabase: SupabaseClient<Database>;
  item: OrderItem;
  orderId: string;
  paymentMethod: keyof typeof PAYMENT_METHOD_LABELS;
};

async function processSaleItem({ supabase, item, orderId, paymentMethod }: ProcessSaleItemParams) {
  // Calculate pricing with dosage surcharge per unit
  const baseUnitPrice = item.code.price;
  const dosageSurchargePerUnit = Math.max(0, (item.dosageCount || 1) - 1) * EXTRA_SHOT_PRICE;
  const effectiveUnitPrice = baseUnitPrice + dosageSurchargePerUnit;
  const isTreatItem = paymentMethod === 'treat' ? true : item.isTreat;

  // Insert into order_items to align with read path and DB triggers
  const { error: itemError } = await supabase.from('order_items').insert({
    order_id: orderId,
    product_id: item.code.id,
    quantity: item.quantity,
    unit_price: effectiveUnitPrice,
    line_total: effectiveUnitPrice * item.quantity,
    is_treat: isTreatItem,
  });

  if (itemError) {
    throw new Error(`${API_ERROR_MESSAGES.SERVER_ERROR}: ${itemError.message}`);
  }
}

async function fetchCodesAndCategories(supabase: SupabaseClient<Database>) {
  const [codesResult, { data: categoriesData, error: categoriesError }] = await Promise.all([
    fetchProductsForUI(supabase, { isAdmin: false }),
    supabase.from('categories').select('*').order('name'),
  ]);

  if (categoriesError) {
    throw new Error(API_ERROR_MESSAGES.SERVER_ERROR);
  }

  const categoriesMapTemp: CategoriesMap = {};
  for (const category of categoriesData || []) {
    if (category.parent_id) {
      const parentId: string = category.parent_id;
      if (!categoriesMapTemp[parentId]) {
        categoriesMapTemp[parentId] = [];
      }
      categoriesMapTemp[parentId].push(category);
    }
  }

  return { codesData: codesResult as unknown as Code[], categoriesMapTemp };
}

export function useSales() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<Code[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cardDiscountCount, setCardDiscountCount] = useState(0);
  const [categoriesMap, setCategoriesMap] = useState<CategoriesMap>({});

  const router = useRouter();
  const supabase = createClientSupabase();

  const categories = Array.from(
    new Set(
      codes
        .filter((code) => code.category && !code.category.parent_id)
        .map((code) => code.category?.name)
        .filter(Boolean) as string[]
    )
  );

  const subtotal = orderItems.reduce((sum, item) => {
    if (item.isTreat) {
      return sum;
    }
    const dosageSurchargePerUnit = Math.max(0, (item.dosageCount || 1) - 1) * EXTRA_SHOT_PRICE;
    const unitPriceWithDosage = (item.code.price || 0) + dosageSurchargePerUnit;
    return sum + unitPriceWithDosage * item.quantity;
  }, 0);

  const cardDiscount = cardDiscountCount * CARD_DISCOUNT;
  const finalTotal = Math.max(0, subtotal - cardDiscount);

  const fetchCodesAndCategoriesData = useCallback(async () => {
    try {
      const { codesData, categoriesMapTemp } = await fetchCodesAndCategories(supabase);
      setCodes((codesData as unknown as Code[]) || []);
      setFilteredCodes((codesData as unknown as Code[]) || []);
      setCategoriesMap(categoriesMapTemp);
    } catch (_err) {
      toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
    }
  }, [supabase]);

  useEffect(() => {
    let filtered = codes;
    const query = searchQuery.toLowerCase();

    if (query) {
      filtered = filtered.filter(
        (code) =>
          code.name.toLowerCase().includes(query) ||
          code.category?.name.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      const categoryId = codes.find((code) => code.category?.name === selectedCategory)?.category
        ?.id;

      filtered = selectedSubcategory
        ? filtered.filter((code) => code.category?.name === selectedSubcategory)
        : filtered.filter(
            (code) =>
              code.category?.name === selectedCategory ||
              (categoryId &&
                categoriesMap[categoryId]?.some((subCat) => subCat.name === code.category?.name))
          );
    }

    setFilteredCodes(filtered);
  }, [searchQuery, selectedCategory, selectedSubcategory, codes, categoriesMap]);

  const removeItem = useCallback((itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const toggleTreat = useCallback((itemId: string) => {
    setOrderItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, isTreat: !item.isTreat } : item))
    );
  }, []);

  const increaseDosage = useCallback((itemId: string) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, dosageCount: (item.dosageCount || 1) + 1 } : item
      )
    );
  }, []);

  const changeQuantity = useCallback((itemId: string, quantity: number) => {
    setOrderItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  }, []);

  const handlePayment = useCallback(
    async (paymentMethod: keyof typeof PAYMENT_METHOD_LABELS) => {
      if (!orderItems.length) {
        toast.error(SALES_MESSAGES.NO_ITEMS);
        return;
      }

      setLoading(true);
      try {
        const registerSession =
          (await getActiveRegisterSession(supabase)) || (await createNewRegisterSession(supabase));

        const orderTotal = orderItems.reduce((total, item) => {
          const dosageSurchargePerUnit =
            Math.max(0, (item.dosageCount || 1) - 1) * EXTRA_SHOT_PRICE;
          const unitPriceWithDosage = item.code.price + dosageSurchargePerUnit;
          return total + unitPriceWithDosage * item.quantity;
        }, 0);

        const orderData = await createOrder({
          supabase,
          registerSessionId: registerSession.id,
          orderTotal,
          cardDiscountCount,
          paymentMethod,
        });

        for (const item of orderItems) {
          await processSaleItem({
            supabase,
            item,
            orderId: orderData.id,
            paymentMethod,
          });
        }

        toast.success(SALES_MESSAGES.CREATE_SUCCESS);
        router.refresh();
        setOrderItems([]);
        setCardDiscountCount(0);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : API_ERROR_MESSAGES.SERVER_ERROR;
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [orderItems, cardDiscountCount, supabase, router]
  );

  return {
    codes,
    filteredCodes,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    orderItems,
    loading,
    cardDiscountCount,
    categoriesMap,
    categories,
    subtotal,
    cardDiscount,
    finalTotal,
    setSearchQuery,
    setSelectedCategory,
    setSelectedSubcategory,
    setCardDiscountCount,
    setOrderItems,
    fetchCodes: fetchCodesAndCategoriesData,
    removeItem,
    toggleTreat,
    increaseDosage,
    changeQuantity,
    handlePayment,
  };
}
