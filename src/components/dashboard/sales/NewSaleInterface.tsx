'use client';

import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import type { Category, OrderItem as OrderItemType, Product } from '@/types/sales';
import { EXTRA_SHOT_PRICE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useSales } from '@/hooks/features/sales/useSales';
import { useMediaQuery } from '@/hooks/utils/useMediaQuery';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { CartSection } from './components/CartSection';
import { CategorySection } from './components/CategorySection';
import { ProductSection } from './components/ProductSection';

interface NewSaleInterfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewSaleInterface({ open, onOpenChange }: NewSaleInterfaceProps) {
  const { products, categories: allCategories, categoriesMap, isLoading, createSale } = useSales();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const [orderItems, setOrderItems] = useState<OrderItemType[]>([]);
  const [cardDiscountCount, setCardDiscountCount] = useState(0);
  const [view, setView] = useState<'products' | 'categories' | 'cart'>('products');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = allCategories.filter((c: Category) => !c.parentId);

  const resetState = () => {
    setOrderItems([]);
    setCardDiscountCount(0);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchQuery('');
    setView('products');
  };

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);
  const filteredProducts = useMemo(() => {
    let filtered = products;

    if (selectedSubcategory) {
      filtered = filtered.filter((p: Product) => p.category?.id === selectedSubcategory.id);
    } else if (selectedCategory) {
      filtered = filtered.filter(
        (p: Product) =>
          p.category?.id === selectedCategory.id || p.category?.parentId === selectedCategory.id
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p: Product) => p.name.toLowerCase().includes(query) || p.id.toString().includes(query)
      );
    }
    return filtered.sort((a: Product, b: Product) => a.name.localeCompare(b.name));
  }, [products, selectedCategory, selectedSubcategory, searchQuery]);

  const totals = useMemo(() => {
    let subtotal = 0;
    let treatsValue = 0;

    orderItems.forEach(item => {
      const dosageExtra =
        item.dosageCount && item.dosageCount > 1 ? (item.dosageCount - 1) * EXTRA_SHOT_PRICE : 0;
      const itemPrice = ((parseFloat(item.product.price) || 0) + dosageExtra) * item.quantity;

      if (item.isTreat) {
        treatsValue += itemPrice;
      } else {
        subtotal += itemPrice;
      }
    });

    const finalTotal = Math.max(0, subtotal - cardDiscountCount * 2);
    return { subtotal, finalTotal, treatsValue };
  }, [orderItems, cardDiscountCount]);

  const productSectionTitle = useMemo(() => {
    if (searchQuery) {
      return 'Αποτελέσματα Αναζήτησης';
    }
    if (selectedSubcategory) {
      return selectedSubcategory.name;
    }
    if (selectedCategory) {
      return selectedCategory.name;
    }
    return 'Όλα τα προϊόντα';
  }, [selectedCategory, selectedSubcategory, searchQuery]);

  const addProduct = (product: Product) => {
    setOrderItems(prev => [
      ...prev,
      {
        id: uuidv4(),
        product,
        quantity: 1,
        isTreat: false,
      },
    ]);
    if (!isDesktop) {
      setView('cart');
    }
  };

  const removeItem = (id: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleTreat = (id: string) => {
    setOrderItems(prev =>
      prev.map(item => (item.id === id ? { ...item, isTreat: !item.isTreat } : item))
    );
  };

  const increaseDosage = (id: string) => {
    setOrderItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, dosageCount: (item.dosageCount || 1) + 1 } : item
      )
    );
  };

  const handlePayment = async () => {
    if (!orderItems.length) {
      return;
    }
    await createSale({
      items: orderItems,
      totalAmount: totals.subtotal,
      finalAmount: totals.finalTotal,
      cardDiscountCount,
    });
    resetState();
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  };

  const renderContent = () => {
    if (isDesktop) {
      return (
        <div className="grid h-full grid-cols-[300px_1fr_380px]">
          <div className="border-r">
            <CategorySection
              categories={categories}
              categoriesMap={categoriesMap}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategorySelect={setSelectedCategory}
              onSubcategorySelect={setSelectedSubcategory}
              products={products}
            />
          </div>
          <div className="border-r">
            <ProductSection
              products={filteredProducts}
              title={productSectionTitle}
              onProductSelect={addProduct}
              searchQuery={searchQuery}
              onSearchChange={(value: string) => setSearchQuery(value)}
              cartItemsCount={orderItems.length}
            />
          </div>
          <div>
            <CartSection
              orderItems={orderItems}
              onRemove={removeItem}
              onTreatToggle={toggleTreat}
              onDosageIncrease={increaseDosage}
              subtotal={totals.subtotal}
              treatsValue={totals.treatsValue}
              finalTotal={totals.finalTotal}
              cardDiscountCount={cardDiscountCount}
              onCardDiscountIncrease={() => setCardDiscountCount(prev => prev + 1)}
              onCardDiscountDecrease={() => setCardDiscountCount(prev => Math.max(0, prev - 1))}
              onCardDiscountReset={() => setCardDiscountCount(0)}
              onPayment={handlePayment}
              loading={isLoading}
              onShowProducts={() => setView('products')}
            />
          </div>
        </div>
      );
    }

    if (view === 'categories') {
      return (
        <CategorySection
          isMobile
          categories={categories}
          categoriesMap={categoriesMap}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onCategorySelect={setSelectedCategory}
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
          onRemove={removeItem}
          onTreatToggle={toggleTreat}
          onDosageIncrease={increaseDosage}
          subtotal={totals.subtotal}
          treatsValue={totals.treatsValue}
          finalTotal={totals.finalTotal}
          cardDiscountCount={cardDiscountCount}
          onCardDiscountIncrease={() => setCardDiscountCount(prev => prev + 1)}
          onCardDiscountDecrease={() => setCardDiscountCount(prev => Math.max(0, prev - 1))}
          onCardDiscountReset={() => setCardDiscountCount(0)}
          onPayment={handlePayment}
          loading={isLoading}
          onShowProducts={() => setView('products')}
        />
      );
    }

    return (
      <ProductSection
        isMobile
        products={filteredProducts}
        title={productSectionTitle}
        onProductSelect={addProduct}
        searchQuery={searchQuery}
        onSearchChange={(value: string) => setSearchQuery(value)}
        onShowCategories={() => setView('categories')}
        onShowCart={() => setView('cart')}
        cartItemsCount={orderItems.length}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn('flex h-full w-full max-w-none flex-col gap-0 overflow-hidden p-0')}
      >
        <DialogHeader className="hidden shrink-0 border-b p-4 lg:block">
          <DialogTitle>Νέα Πώληση</DialogTitle>
        </DialogHeader>
        <div className="grow overflow-auto">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
