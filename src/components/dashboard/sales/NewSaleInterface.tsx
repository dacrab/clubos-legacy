"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useMediaQuery } from "@/hooks/utils/useMediaQuery";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CategorySection } from "./components/CategorySection";
import { ProductSection } from "./components/ProductSection";
import { CartSection } from "./components/CartSection";
import { useSales } from '@/hooks/features/sales/useSales';
import { cn } from "@/lib/utils";
import type { OrderItem as OrderItemType, Product, Category } from "@/types/sales";

// ----------------------
// Type Definitions
// ----------------------
interface NewSaleInterfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ----------------------
// Main Component
// ----------------------
export default function NewSaleInterface({ open, onOpenChange }: NewSaleInterfaceProps) {
  // Sales data and actions
  const {
    products,
    categoriesMap,
    isLoading: salesLoading,
    createSale,
    isCreating,
  } = useSales();

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // State
  const [orderItems, setOrderItems] = useState<OrderItemType[]>([]);
  const [cardDiscountCount, setCardDiscountCount] = useState(0);
  const [view, setView] = useState<'products' | 'categories' | 'cart'>('products');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    const mainCategories: (Product['category'])[] = [];
    const seen = new Set<string>();
    products.forEach(p => {
      if (p.category && !p.category.parent_id && !seen.has(p.category.id)) {
        mainCategories.push(p.category);
        seen.add(p.category.id);
      }
    });
    return mainCategories.filter(Boolean) as Category[];
  }, [products]);

  // Reset all state
  const handleReset = useCallback(() => {
    setOrderItems([]);
    setCardDiscountCount(0);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchQuery("");
    setView('products');
  }, []);

  // Reset on open
  useEffect(() => {
    if (open) handleReset();
  }, [open, handleReset]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedCategory) {
      const categoryId = products.find(p => p.category?.name === selectedCategory)?.category?.id;
      if (categoryId) {
        filtered = filtered.filter(
          p => p.category?.id === categoryId || p.category?.parent_id === categoryId
        );
      }
    }
    if (selectedSubcategory) {
      filtered = filtered.filter(p => p.category?.name === selectedSubcategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p => p.name.toLowerCase().includes(q) || p.id.toString().includes(q)
      );
    }
    return filtered.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [products, selectedCategory, selectedSubcategory, searchQuery]);

  // Totals
  const { subtotal, finalTotal } = useMemo(() => {
    const subtotal = orderItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const finalTotal = Math.max(0, subtotal - cardDiscountCount * 2);
    return { subtotal, finalTotal };
  }, [orderItems, cardDiscountCount]);

  // Product section title
  const productSectionTitle = useMemo(() => {
    if (searchQuery) return "Αποτελέσματα Αναζήτησης";
    if (selectedSubcategory) return selectedSubcategory;
    if (selectedCategory) return selectedCategory;
    return "Όλα τα προϊόντα";
  }, [selectedCategory, selectedSubcategory, searchQuery]);

  // Handlers
  const handleProductSelect = useCallback((product: Product) => {
    setOrderItems(prev => {
      const existing = prev.find(item => item.product.id === product.id && !item.isTreat);
      if (existing) {
        return prev.map(item =>
          item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        { id: uuidv4(), product, quantity: 1, isTreat: false }
      ];
    });
    if (!isDesktop) setView('cart');
  }, [isDesktop]);

  const handleRemoveItem = useCallback((id: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleToggleTreat = useCallback((id: string) => {
    setOrderItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isTreat: !item.isTreat } : item
      )
    );
  }, []);

  const handleIncreaseDosage = useCallback((id: string) => {
    setOrderItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }, []);

  const handleCategorySelect = useCallback((category: string | null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    if (!isDesktop) setView('products');
  }, [isDesktop]);

  const handleSubcategorySelect = useCallback((name: string) => {
    setSelectedSubcategory(name);
    if (!isDesktop) setView('products');
  }, [isDesktop]);

  const handleCardDiscount = useCallback(() => {
    const nonTreatCount = orderItems.filter(item => !item.isTreat).length;
    if (cardDiscountCount < Math.floor(nonTreatCount / 3)) {
      setCardDiscountCount(prev => prev + 1);
    }
  }, [orderItems, cardDiscountCount]);

  const handleCardDiscountReset = useCallback(() => setCardDiscountCount(0), []);

  const handlePayment = useCallback(async () => {
    if (!orderItems.length) return;
    await createSale({
      items: orderItems,
      totalAmount: subtotal,
      finalAmount: finalTotal,
      cardDiscountCount,
    });
    onOpenChange(false);
    handleReset();
  }, [createSale, onOpenChange, handleReset, orderItems, subtotal, finalTotal, cardDiscountCount]);

  const handleCloseDialog = (isOpen: boolean) => {
    if (!isOpen) handleReset();
    onOpenChange(isOpen);
  };

  // Renderers
  const renderDesktopView = () => (
    <div className="grid grid-cols-[300px_1fr_380px] h-[calc(100vh-100px)]">
      <div className="border-r">
        <CategorySection
          categories={categories.map(c => c.name)}
          categoriesMap={categoriesMap}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onCategorySelect={handleCategorySelect}
          onSubcategorySelect={handleSubcategorySelect}
          products={products}
        />
      </div>
      <div className="border-r">
        <ProductSection
          products={filteredProducts}
          title={productSectionTitle}
          onProductSelect={handleProductSelect}
          searchQuery={searchQuery}
          onSearchChange={e => setSearchQuery(e.target.value)}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          cartItemsCount={orderItems.length}
        />
      </div>
      <div>
        <CartSection
          orderItems={orderItems}
          onRemove={handleRemoveItem}
          onTreatToggle={handleToggleTreat}
          onDosageIncrease={handleIncreaseDosage}
          subtotal={subtotal}
          finalTotal={finalTotal}
          cardDiscountCount={cardDiscountCount}
          onCardDiscountIncrease={handleCardDiscount}
          onCardDiscountReset={handleCardDiscountReset}
          onPayment={handlePayment}
          loading={salesLoading}
        />
      </div>
    </div>
  );

  const renderMobileView = () => {
    if (view === 'categories') {
      return (
        <CategorySection
          isMobile
          categories={categories.map(c => c.name)}
          categoriesMap={categoriesMap}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onCategorySelect={handleCategorySelect}
          onSubcategorySelect={handleSubcategorySelect}
          onClose={() => setView('products')}
          products={products}
        />
      );
    }
    if (view === 'cart') {
      return (
        <CartSection
          isMobile
          orderItems={orderItems}
          onRemove={handleRemoveItem}
          onTreatToggle={handleToggleTreat}
          onDosageIncrease={handleIncreaseDosage}
          subtotal={subtotal}
          finalTotal={finalTotal}
          cardDiscountCount={cardDiscountCount}
          onCardDiscountIncrease={handleCardDiscount}
          onCardDiscountReset={handleCardDiscountReset}
          onPayment={handlePayment}
          loading={salesLoading}
          onShowProducts={() => setView('products')}
        />
      );
    }
    return (
      <ProductSection
        isMobile
        products={filteredProducts}
        title={productSectionTitle}
        onProductSelect={handleProductSelect}
        searchQuery={searchQuery}
        onSearchChange={e => setSearchQuery(e.target.value)}
        onShowCategories={() => setView('categories')}
        onShowCart={() => setView('cart')}
        cartItemsCount={orderItems.length}
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className={cn(
        "max-w-none w-full h-full lg:h-auto lg:w-auto p-0 gap-0 overflow-hidden",
        "lg:max-w-7xl"
      )}>
        <DialogHeader className="p-4 border-b hidden lg:block">
          <DialogTitle>Νέα Πώληση</DialogTitle>
        </DialogHeader>
        <div className="h-full lg:h-auto">
          {isDesktop ? renderDesktopView() : renderMobileView()}
        </div>
      </DialogContent>
    </Dialog>
  );
}