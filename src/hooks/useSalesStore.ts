import { useState, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { EXTRA_SHOT_PRICE, CARD_DISCOUNT } from '@/lib/constants';
import type { OrderItem, Code } from '@/types/sales';

export function useSalesStore() {
  // States for the sales interface
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [cardDiscountCount, setCardDiscountCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Add an item to the order
  const addItem = useCallback((code: Code) => {
    setOrderItems(prev => {
      // Check if the item already exists
      const existingItem = prev.find(item => 
        item.code.id === code.id && !item.isTreat
      );
      
      if (existingItem) {
        // Update quantity if item exists
        return prev.map(item => 
          item.id === existingItem.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Add new item
        return [...prev, {
          id: uuidv4(),
          code,
          codeId: code.id,
          quantity: 1,
          isTreat: false,
          dosageCount: 1,
        }];
      }
    });
  }, []);

  // Remove an item from the order
  const removeItem = useCallback((itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // Toggle treat status
  const toggleTreat = useCallback((itemId: string) => {
    setOrderItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isTreat: !item.isTreat } : item
    ));
  }, []);

  // Change quantity of an item
  const changeQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(prev => prev.filter(item => item.id !== itemId));
      return;
    }
    
    setOrderItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    ));
  }, []);

  // Increase dosage (extra shot)
  const increaseDosage = useCallback((itemId: string) => {
    setOrderItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, dosageCount: (item.dosageCount || 1) + 1 } : item
    ));
  }, []);

  // Increase card discount count
  const increaseCardDiscount = useCallback(() => {
    setCardDiscountCount(prev => prev + 1);
  }, []);

  // Reset card discount count
  const resetCardDiscount = useCallback(() => {
    setCardDiscountCount(0);
  }, []);

  // Reset the cart
  const resetCart = useCallback(() => {
    setOrderItems([]);
    setCardDiscountCount(0);
  }, []);

  // Calculate subtotal and final total
  const cartTotals = useMemo(() => {
    const subtotal = orderItems.reduce((sum, item) => {
      if (item.isTreat) {return sum;}
      
      const basePrice = (item.code.price || 0) * item.quantity;
      const dosageExtra = (item.dosageCount || 1) > 1 
        ? (item.dosageCount! - 1) * EXTRA_SHOT_PRICE * item.quantity
        : 0;
        
      return sum + basePrice + dosageExtra;
    }, 0);

    const cardDiscount = cardDiscountCount * CARD_DISCOUNT;
    const finalTotal = Math.max(0, subtotal - cardDiscount);
    
    return {
      subtotal,
      cardDiscount,
      finalTotal,
      itemCount: orderItems.reduce((sum, item) => sum + item.quantity, 0),
      treatsCount: orderItems.filter(item => item.isTreat).length,
    };
  }, [orderItems, cardDiscountCount]);

  const setLoading$ = useCallback((isLoading: boolean) => {
    setLoading(isLoading);
  }, []);

  return {
    // States
    orderItems,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    cardDiscountCount,
    loading,
    
    // Calculations
    cartTotals,
    
    // Actions
    setSearchQuery,
    setSelectedCategory,
    setSelectedSubcategory,
    addItem,
    removeItem,
    toggleTreat,
    changeQuantity,
    increaseDosage,
    increaseCardDiscount,
    resetCardDiscount,
    resetCart,
    setLoading: setLoading$,
  };
} 