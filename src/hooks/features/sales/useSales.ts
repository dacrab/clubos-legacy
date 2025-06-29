import { useState, useEffect, useCallback } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { Product, OrderItem, CategoriesMap } from "@/types/sales";
import { 
  API_ERROR_MESSAGES, 
  SALES_MESSAGES, 
  UNLIMITED_STOCK,
  EXTRA_SHOT_PRICE,
  CARD_DISCOUNT,
  PAYMENT_METHOD_LABELS,
  REGISTER_MESSAGES
} from "@/lib/constants";

export function useSales() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [cardDiscountCount, setCardDiscountCount] = useState(0);
  const [categoriesMap, setCategoriesMap] = useState<CategoriesMap>({});
  const [currentRegisterSession, setCurrentRegisterSession] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClientSupabase();

  const categories = Array.from(new Set(
    products
      .filter(product => product.category && !product.category.parent_id)
      .map(product => product.category!.name)
  ));

  const subtotal = orderItems.reduce((sum, item) => {
    if (item.isTreat) return sum;
    const dosageExtra = (item.dosageCount || 1) > 1 
      ? (item.dosageCount! - 1) * EXTRA_SHOT_PRICE 
      : 0;
    return sum + (item.product?.price || 0) + dosageExtra;
  }, 0);

  const cardDiscount = cardDiscountCount * CARD_DISCOUNT;
  const finalTotal = Math.max(0, subtotal - cardDiscount);

  const fetchProducts = useCallback(async () => {
    try {
      const [{ data: productsData, error: productsError }, { data: categoriesData, error: categoriesError }] = 
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

      if (productsError || categoriesError) throw new Error(API_ERROR_MESSAGES.SERVER_ERROR);

      const categoriesMapTemp = categoriesData?.reduce((acc: CategoriesMap, category) => {
        if (category.parent_id) {
          acc[category.parent_id] = [...(acc[category.parent_id] || []), category];
        }
        return acc;
      }, {});

      setProducts(productsData || []);
      setFilteredProducts(productsData || []);
      setCategoriesMap(categoriesMapTemp);

    } catch (err) {
      console.error('Exception in fetchProducts:', err);
      toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
    }
  }, [supabase]);

  useEffect(() => {
    let filtered = products;
    const query = searchQuery.toLowerCase();

    if (query) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.category?.name.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      const categoryId = products.find(
        product => product.category?.name === selectedCategory
      )?.category?.id;

      filtered = selectedSubcategory
        ? filtered.filter(product => product.category?.name === selectedSubcategory)
        : filtered.filter(product => 
            product.category?.name === selectedCategory || 
            categoriesMap[categoryId!]?.some(
              subCat => subCat.name === product.category?.name
            )
          );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, selectedSubcategory, products, categoriesMap]);

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
      if (userError || !user) throw new Error(SALES_MESSAGES.NO_USER_ERROR);

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

        if (sessionError) throw new Error('Failed to create register session');
        registerSessionId = newSession.id;
        toast.success(REGISTER_MESSAGES.SESSION_CREATED);
      } else {
        registerSessionId = activeSession.id;
      }

      // Calculate order totals
      const orderTotal = orderItems.reduce((total, item) => {
        if (!item.product) return total;
        const basePrice = item.product.price * item.quantity;
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

      if (orderError) throw new Error('Failed to create order: ' + orderError.message);

      // Process sales
      for (const item of orderItems) {
        if (!item.product) continue;

        const unitPrice = item.product.price;
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
            code_id: item.product.id,
            quantity: item.quantity,
            unit_price: unitPrice,
            total_price: totalPrice,
            is_treat: isTreatItem
          });

        if (saleError) throw new Error('Failed to create sale: ' + saleError.message);

        // Update stock if needed
        if (item.product.stock !== UNLIMITED_STOCK) {
          const { error: stockError } = await supabase
            .from('codes')
            .update({ stock: item.product.stock - item.quantity })
            .eq('id', item.product.id);

          if (stockError) throw new Error(`Failed to update stock for ${item.product.name}: ${stockError.message}`);
        }
      }

      toast.success(SALES_MESSAGES.CREATE_SUCCESS);
      router.refresh();
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
    products,
    filteredProducts,
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
    fetchProducts,
    removeItem,
    toggleTreat,
    increaseDosage,
    changeQuantity,
    handlePayment
  };
}