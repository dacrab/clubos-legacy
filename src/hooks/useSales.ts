import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { 
  API_ERROR_MESSAGES, 
  SALES_MESSAGES, 
  UNLIMITED_STOCK,
  EXTRA_SHOT_PRICE,
  CARD_DISCOUNT,
  type PAYMENT_METHOD_LABELS,
  REGISTER_MESSAGES
} from "@/lib/constants";
import { createClientSupabase } from "@/lib/supabase";
import type { Code, OrderItem, CategoriesMap } from "@/types/sales";

export function useSales() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<Code[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cardDiscountCount, setCardDiscountCount] = useState(0);
  const [categoriesMap, setCategoriesMap] = useState<CategoriesMap>({});

  const router = useRouter();
  const supabase = createClientSupabase() as any;

  const categories = Array.from(new Set(
    codes
      .filter(code => code.category && !code.category.parent_id)
      .map(code => code.category!.name)
  ));

  const subtotal = orderItems.reduce((sum, item) => {
    if (item.isTreat) {return sum;}
    const dosageExtra = (item.dosageCount || 1) > 1 
      ? (item.dosageCount! - 1) * EXTRA_SHOT_PRICE 
      : 0;
    return sum + (item.code.price || 0) + dosageExtra;
  }, 0);

  const cardDiscount = cardDiscountCount * CARD_DISCOUNT;
  Math.max(0, subtotal - cardDiscount);

  const fetchCodes = useCallback(async () => {
    try {
      const [{ data: codesData, error: codesError }, { data: categoriesData, error: categoriesError }] = 
        await Promise.all([
          supabase
            .from('codes')
            .select(`*, category:categories!codes_category_id_fkey (*)`)
            .or(`stock.gt.0,stock.eq.${UNLIMITED_STOCK}`)
            .order('name'),
          supabase
            .from('categories')
            .select('*')
            .order('name')
        ]);

      if (codesError || categoriesError) {throw new Error(API_ERROR_MESSAGES.SERVER_ERROR);}

      const categoriesMapTemp: CategoriesMap = {};
      for (const category of categoriesData || []) {
        if (!category.parent_id) {continue;}
        const parentId: string = category.parent_id;
        const list = categoriesMapTemp[parentId] ?? (categoriesMapTemp[parentId] = []);
        list.push(category);
      }

      setCodes(codesData || []);
      setFilteredCodes(codesData || []);
      setCategoriesMap(categoriesMapTemp);

    } catch (err) {
      console.error('Exception in fetchCodes:', err);
      toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
    }
  }, [supabase]);

  useEffect(() => {
    let filtered = codes;
    const query = searchQuery.toLowerCase();

    if (query) {
      filtered = filtered.filter(code => 
        code.name.toLowerCase().includes(query) ||
        code.category?.name.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      const categoryId = codes.find(
        code => code.category?.name === selectedCategory
      )?.category?.id;

      filtered = selectedSubcategory
        ? filtered.filter(code => code.category?.name === selectedSubcategory)
        : filtered.filter(code => 
            code.category?.name === selectedCategory || 
            categoriesMap[categoryId!].some(
              subCat => subCat.name === code.category?.name
            )
          );
    }

    setFilteredCodes(filtered);
  }, [searchQuery, selectedCategory, selectedSubcategory, codes, categoriesMap]);

  const removeItem = useCallback((itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const toggleTreat = useCallback((itemId: string) => {
    setOrderItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isTreat: !item.isTreat } : item
    ));
  }, []);

  const increaseDosage = useCallback((itemId: string) => {
    setOrderItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, dosageCount: (item.dosageCount || 1) + 1 } : item
    ));
  }, []);

  const changeQuantity = useCallback((itemId: string, quantity: number) => {
    setOrderItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  }, []);

  const handlePayment = useCallback(async (method: keyof typeof PAYMENT_METHOD_LABELS) => {
    if (!orderItems.length) {
      toast.error(SALES_MESSAGES.NO_ITEMS);
      return;
    }

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {throw new Error(SALES_MESSAGES.NO_USER_ERROR);}

      // Get or create active register session
      let registerSessionId: string;
      const { data: activeSession } = await supabase
        .from('register_sessions')
        .select('id')
        .is('closed_at', null)
        .single();

      if (!activeSession) {
        // Create new register session
        const { data: newSession, error: sessionError } = await supabase
          .from('register_sessions')
          .insert({
            opened_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (sessionError) {throw new Error('Failed to create register session');}
        registerSessionId = newSession.id;
        toast.success(REGISTER_MESSAGES.SESSION_CREATED);
      } else {
        registerSessionId = activeSession.id;
      }

      // Calculate order totals
      const orderTotal = orderItems.reduce((total, item) => {
        const basePrice = item.code.price * item.quantity;
        const extraShotCost = ((item.dosageCount || 1) - 1) * EXTRA_SHOT_PRICE;
        return total + basePrice + extraShotCost;
      }, 0);

      const totalDiscount = cardDiscountCount * CARD_DISCOUNT;

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          register_session_id: registerSessionId,
          total_amount: orderTotal,
          final_amount: Math.max(0, orderTotal - totalDiscount),
          card_discount_count: cardDiscountCount,
          created_by: user.id
        })
        .select('id')
        .single();

      if (orderError) {throw new Error('Failed to create order: ' + orderError.message);}

      // Process sales
      for (const item of orderItems) {
        const unitPrice = item.code.price;
        const baseTotal = unitPrice * item.quantity;
        const extraShotCost = ((item.dosageCount || 1) - 1) * EXTRA_SHOT_PRICE;
        const isTreatItem = method === 'treat' ? true : item.isTreat;
        
        // Apply the actual total price, treats are marked with is_treat flag
        const totalPrice = baseTotal + extraShotCost;

        // Create sale record
        const { error: saleError } = await supabase
          .from('sales')
          .insert({
            order_id: orderData.id,
            code_id: item.code.id,
            quantity: item.quantity,
            unit_price: unitPrice,
            total_price: totalPrice,
            is_treat: isTreatItem
          });

        if (saleError) {throw new Error('Failed to create sale: ' + saleError.message);}

        // Update stock if needed
        if (item.code.stock !== UNLIMITED_STOCK) {
          const { error: stockError } = await supabase
            .from('codes')
            .update({ stock: item.code.stock - item.quantity })
            .eq('id', item.code.id);

          if (stockError) {throw new Error(`Failed to update stock for ${item.code.name}: ${stockError.message}`);}
        }
      }

      toast.success(SALES_MESSAGES.CREATE_SUCCESS);
      void router.refresh();
      setOrderItems([]);
      setCardDiscountCount(0);
      
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || API_ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  }, [orderItems, cardDiscountCount, supabase, router]);

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
    cardDiscount: cardDiscountCount * CARD_DISCOUNT,
    finalTotal: Math.max(0, subtotal - (cardDiscountCount * CARD_DISCOUNT)),
    setSearchQuery,
    setSelectedCategory,
    setSelectedSubcategory,
    setCardDiscountCount,
    setOrderItems,
    fetchCodes,
    removeItem,
    toggleTreat,
    increaseDosage,
    changeQuantity,
    handlePayment
  };
}