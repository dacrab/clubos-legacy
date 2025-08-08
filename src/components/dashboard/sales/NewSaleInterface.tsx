"use client";

import { useEffect, useMemo, useCallback, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/utils/useMediaQuery";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CategorySection } from "./components/CategorySection";
import { ProductSection } from "./components/ProductSection";
import { CartSection } from "./components/CartSection";
import { useSales } from '@/hooks/features/sales/useSales';
import { cn } from "@/lib/utils";
import type { OrderItem as OrderItemType, Product, Category } from "@/types/sales";
import { EXTRA_SHOT_PRICE } from "@/lib/constants";

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
    categories: allCategories,
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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const categories = useMemo(() => {
    return allCategories.filter((c) => !c.parent_id);
  }, [allCategories]);

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

  const handleCategorySelect = (category: Category | null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedSubcategory) {
      filtered = filtered.filter(p => p.category?.id === selectedSubcategory.id);
    } else if (selectedCategory) {
      const categoryId = selectedCategory.id;
      filtered = filtered.filter(
        p => p.category?.id === categoryId || p.category?.parent_id === categoryId
      );
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
  const { subtotal, finalTotal, treatsValue } = useMemo(() => {
    let subtotal = 0;
    let treatsValue = 0;

    orderItems.forEach(item => {
      const dosageExtra = item.dosageCount && item.dosageCount > 1 ? (item.dosageCount - 1) * EXTRA_SHOT_PRICE : 0;
      const itemPrice = ((item.product.price || 0) + dosageExtra) * item.quantity;

      if (item.isTreat) {
        treatsValue += itemPrice;
      } else {
        subtotal += itemPrice;
      }
    });

    const finalTotal = Math.max(0, subtotal - (cardDiscountCount * 2));
    return { subtotal, finalTotal, treatsValue };
  }, [orderItems, cardDiscountCount]);

  // Product section title
  const productSectionTitle = useMemo(() => {
    if (searchQuery) return "Αποτελέσματα Αναζήτησης";
    if (selectedSubcategory) return selectedSubcategory.name;
    if (selectedCategory) return selectedCategory.name;
    return "Όλα τα προϊόντα";
  }, [selectedCategory, selectedSubcategory, searchQuery]);

  // Handlers
  const handleProductSelect = useCallback((product: Product) => {
    setOrderItems(prev => {
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

  const handleDosageIncrease = useCallback((id: string) => {
    setOrderItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, dosageCount: (item.dosageCount || 1) + 1 } : item
      )
    );
  }, []);

  const handleCardDiscountIncrease = useCallback(() => {
    setCardDiscountCount(prev => prev + 1);
  }, []);

  const handleCardDiscountDecrease = useCallback(() => {
    setCardDiscountCount(prev => Math.max(0, prev - 1));
  }, []);

  const handleCardDiscountReset = useCallback(() => setCardDiscountCount(0), []);

  const handlePayment = useCallback(async () => {
    if (!orderItems.length) return;
    await createSale({
      items: orderItems,
      totalAmount: subtotal,
      finalAmount: finalTotal,
      cardDiscountCount,
    });
    handleReset();
  }, [createSale, handleReset, orderItems, subtotal, finalTotal, cardDiscountCount]);

  const handleCloseDialog = (isOpen: boolean) => {
    if (!isOpen) handleReset();
    onOpenChange(isOpen);
  };

  // Renderers
  const renderDesktopView = () => (
    <div className="grid grid-cols-[300px_1fr_380px] h-full">
      <div className="border-r">
        <CategorySection
          categories={categories}
          categoriesMap={categoriesMap}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onCategorySelect={handleCategorySelect}
          onSubcategorySelect={setSelectedSubcategory}
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
          selectedCategory={selectedCategory?.name ?? null}
          selectedSubcategory={selectedSubcategory?.name ?? null}
          cartItemsCount={orderItems.length}
        />
      </div>
      <div>
        <CartSection
          orderItems={orderItems}
          onRemove={handleRemoveItem}
          onTreatToggle={handleToggleTreat}
          onDosageIncrease={handleDosageIncrease}
          subtotal={subtotal}
          treatsValue={treatsValue}
          finalTotal={finalTotal}
          cardDiscountCount={cardDiscountCount}
          onCardDiscountIncrease={handleCardDiscountIncrease}
          onCardDiscountDecrease={handleCardDiscountDecrease}
          onCardDiscountReset={handleCardDiscountReset}
          onPayment={handlePayment}
          loading={salesLoading}
          onShowProducts={() => setView('products')}
        />
      </div>
    </div>
  );

  const renderMobileView = () => {
    if (view === 'categories') {
      return (
        <CategorySection
          isMobile
          categories={categories}
          categoriesMap={categoriesMap}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onCategorySelect={handleCategorySelect}
          onSubcategorySelect={setSelectedSubcategory}
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
          onDosageIncrease={handleDosageIncrease}
          subtotal={subtotal}
          treatsValue={treatsValue}
          finalTotal={finalTotal}
          cardDiscountCount={cardDiscountCount}
          onCardDiscountIncrease={handleCardDiscountIncrease}
          onCardDiscountDecrease={handleCardDiscountDecrease}
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
        selectedCategory={selectedCategory?.name ?? null}
        selectedSubcategory={selectedSubcategory?.name ?? null}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className={cn(
        "max-w-none w-full h-full p-0 gap-0 overflow-hidden flex flex-col"
      )}>
        <DialogHeader className="p-4 border-b hidden lg:block shrink-0">
          <DialogTitle>Νέα Πώληση</DialogTitle>
        </DialogHeader>
        <div className="grow overflow-auto">
          {isDesktop ? renderDesktopView() : renderMobileView()}
        </div>
      </DialogContent>
    </Dialog>
  );
}