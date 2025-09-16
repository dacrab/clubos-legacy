'use client';

import { ChevronLeft, Gift, Menu, Search, ShoppingCart, Tag, X } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useSales } from '@/hooks/use-sales';
import { SALES_ICONS } from '@/lib/constants';
import { cn } from '@/lib/utils/format';

import { OrderItem } from './components/order-item';
import { ProductCard } from './components/product-card';

// Types
type SalesCode = ReturnType<typeof useSales>['codes'][number];
type CartItem = ReturnType<typeof useSales>['orderItems'][number];

// Constants
const MOBILE_BREAKPOINT = 768;
const CARD_DISCOUNT_AMOUNT = 2;

// ------------------------------------------------------------
// Type Definitions
// ------------------------------------------------------------

type NewSaleInterfaceProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type CategorySectionProps = {
  categories: string[];
  categoriesMap: Partial<Record<string, SalesCode['category'][]>>;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onCategorySelect: (category: string | null) => void;
  onSubcategorySelect: (name: string) => void;
  onClose?: () => void;
  codes: SalesCode[];
  isMobile?: boolean;
};

type ProductSectionProps = {
  codes: SalesCode[];
  title?: string;
  onProductSelect: (code: SalesCode) => void;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShowCategories?: () => void;
  onShowCart?: () => void;
  cartItemsCount: number;
  isMobile?: boolean;
  selectedCategory?: string | null;
  selectedSubcategory?: string | null;
};

type CartSectionProps = {
  orderItems: CartItem[];
  onRemove: (id: string) => void;
  onTreatToggle: (id: string) => void;
  onDosageIncrease: (id: string) => void;
  subtotal: number;
  finalTotal: number;
  cardDiscountCount: number;
  onCardDiscountIncrease: () => void;
  onCardDiscountReset: () => void;
  onPayment: () => void;
  loading: boolean;
  onShowProducts?: () => void;
  isMobile?: boolean;
};

// ------------------------------------------------------------
// Helper Components
// ------------------------------------------------------------

const CategoryButton = memo(
  ({
    category,
    isSelected,
    onClick,
  }: {
    category: string | null;
    isSelected: boolean;
    onClick: () => void;
  }) => {
    const handleClick = () => {
      onClick();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    };

    return (
      <button
        aria-label={category ? `Επιλογή κατηγορίας ${category}` : 'Επιλογή όλων των προϊόντων'}
        aria-pressed={isSelected}
        className={cn(
          'w-full rounded-md px-3 py-2 font-medium text-sm transition-colors',
          'focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring',
          isSelected
            ? 'bg-primary text-primary-foreground shadow-xs'
            : 'text-foreground hover:bg-muted/80'
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        type="button"
      >
        {category || 'Όλα τα προϊόντα'}
      </button>
    );
  }
);
CategoryButton.displayName = 'CategoryButton';

const SubcategoryButton = memo(
  ({ name, isSelected, onClick }: { name: string; isSelected: boolean; onClick: () => void }) => {
    const handleClick = () => {
      onClick();
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    };

    return (
      <button
        aria-label={`Επιλογή υποκατηγορίας ${name}`}
        aria-pressed={isSelected}
        className={cn(
          'w-full rounded-md px-3 py-1.5 text-left text-sm',
          'transition-colors duration-200',
          'focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring',
          isSelected
            ? 'bg-primary/10 font-medium text-primary'
            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        type="button"
      >
        <span className="ml-2">↳ {name}</span>
      </button>
    );
  }
);
SubcategoryButton.displayName = 'SubcategoryButton';

// ------------------------------------------------------------
// Main Section Components
// ------------------------------------------------------------

const CategorySection = memo(
  ({
    categories,
    categoriesMap,
    selectedCategory,
    selectedSubcategory,
    onCategorySelect,
    onSubcategorySelect,
    onClose,
    codes,
    isMobile,
  }: CategorySectionProps) => {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        {isMobile && (
          <div className="flex items-center justify-between border-b p-3">
            <h3 className="font-bold text-base">Κατηγορίες</h3>
            {onClose && (
              <Button className="h-8 w-8" onClick={onClose} size="icon" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        <ScrollArea className="flex-1 p-3">
          <div className="space-y-2">
            <CategoryButton
              category={null}
              isSelected={!selectedCategory}
              onClick={() => onCategorySelect(null)}
            />

            {categories.map((category) => (
              <div className="mb-3 space-y-1" key={category}>
                <CategoryButton
                  category={category}
                  isSelected={selectedCategory === category}
                  onClick={() => onCategorySelect(category)}
                />

                {selectedCategory === category && (
                  <div className="mt-1 ml-2 space-y-1">
                    {(() => {
                      const foundCode = codes.find((code) => code.category?.name === category);
                      if (foundCode?.category) {
                        const subcats = categoriesMap[foundCode.category.id] ?? [];
                        return subcats
                          .filter(Boolean)
                          .map((subcat) => (
                            <SubcategoryButton
                              isSelected={selectedSubcategory === subcat?.name}
                              key={subcat?.id}
                              name={subcat?.name || ''}
                              onClick={() => onSubcategorySelect(subcat?.name || '')}
                            />
                          ));
                      }
                      return null;
                    })()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }
);
CategorySection.displayName = 'CategorySection';

const ProductGrid = memo(
  ({
    codes,
    onProductSelect,
  }: {
    codes: SalesCode[];
    onProductSelect: (code: SalesCode) => void;
  }) => (
    <div className="grid grid-cols-2 gap-4 p-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {codes.map((code) => (
        <ProductCard key={code.id} onClick={() => onProductSelect(code)} product={code} />
      ))}
      {codes.length === 0 && (
        <div className="col-span-full py-10 text-center">
          <div className="text-muted-foreground">Δεν βρέθηκαν προϊόντα</div>
        </div>
      )}
    </div>
  )
);
ProductGrid.displayName = 'ProductGrid';

const ProductSection = memo(
  ({
    codes,
    title,
    onProductSelect,
    searchQuery,
    onSearchChange,
    onShowCategories,
    onShowCart,
    cartItemsCount,
    isMobile,
    selectedCategory,
    selectedSubcategory,
  }: ProductSectionProps) => {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex shrink-0 items-center gap-2 border-b p-3">
          {isMobile && onShowCategories && (
            <Button
              className="h-9 w-9 shrink-0"
              onClick={onShowCategories}
              size="icon"
              variant="ghost"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          <div className="relative flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="h-10 w-full pl-9"
              onChange={onSearchChange}
              placeholder="Αναζήτηση προϊόντων..."
              value={searchQuery}
            />
            {searchQuery && (
              <Button
                className="-translate-y-1/2 absolute top-1/2 right-1 h-8 w-8 hover:bg-transparent"
                onClick={() =>
                  onSearchChange({
                    target: { value: '' },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                size="icon"
                variant="ghost"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>

          {isMobile && onShowCart && (
            <Button
              className="flex h-10 items-center gap-1.5"
              onClick={onShowCart}
              size="sm"
              variant="default"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="font-medium">{cartItemsCount}</span>
            </Button>
          )}
        </div>

        {title && (
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="font-bold text-lg">{title}</h2>
            {selectedCategory && selectedSubcategory && (
              <Badge className="font-normal" variant="outline">
                {selectedSubcategory}
              </Badge>
            )}
          </div>
        )}

        <ScrollArea className="flex-1">
          <ProductGrid codes={codes} onProductSelect={onProductSelect} />
        </ScrollArea>
      </div>
    );
  }
);
ProductSection.displayName = 'ProductSection';

const CartSection = memo(
  ({
    orderItems,
    onRemove,
    onTreatToggle,
    onDosageIncrease,
    subtotal,
    finalTotal,
    cardDiscountCount,
    onCardDiscountIncrease,
    onCardDiscountReset,
    onPayment,
    loading,
    onShowProducts,
    isMobile,
  }: CartSectionProps) => {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-card">
        <div className="flex shrink-0 items-center justify-between border-b p-3">
          <div className="flex items-center gap-2">
            {isMobile && onShowProducts && (
              <Button className="h-8 w-8" onClick={onShowProducts} size="icon" variant="ghost">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <h3 className="font-bold">Παραγγελία</h3>
          </div>

          <Badge className="font-medium" variant="outline">
            {orderItems.length} προϊόντα
          </Badge>
        </div>

        <ScrollArea className="w-full flex-1">
          <div className="w-full space-y-2 p-3">
            {orderItems.map((item) => (
              <OrderItem
                cardDiscountCount={cardDiscountCount}
                item={item}
                key={item.id}
                onDosageIncrease={onDosageIncrease}
                onRemove={onRemove}
                onTreatToggle={onTreatToggle}
                subtotal={subtotal}
              />
            ))}

            {orderItems.length === 0 && (
              <div className="w-full py-10 text-center text-muted-foreground">
                <ShoppingCart className="mx-auto mb-2 h-10 w-10 opacity-30" />
                <p>Δεν έχουν προστεθεί προϊόντα</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="w-full space-y-3 border-t bg-background p-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Υποσύνολο:</span>
              <span>{subtotal.toFixed(2)}€</span>
            </div>

            {cardDiscountCount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">Κουπόνι:</span>
                  <Badge className="text-xs" variant="outline">
                    x{cardDiscountCount}
                  </Badge>
                  {cardDiscountCount > 0 && (
                    <Button
                      className="h-5 w-5 rounded-full text-destructive"
                      onClick={onCardDiscountReset}
                      size="icon"
                      variant="ghost"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <span className="text-destructive">
                  -{(cardDiscountCount * CARD_DISCOUNT_AMOUNT).toFixed(2)}€
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 font-bold text-base">
              <span>Σύνολο:</span>
              <span>{finalTotal.toFixed(2)}€</span>
            </div>

            <div className="text-muted-foreground text-sm">
              {orderItems.filter((item) => item.isTreat).length > 0 && (
                <div className="mt-1 flex items-center gap-1.5">
                  <Gift className="h-3.5 w-3.5" />
                  <span>{orderItems.filter((item) => item.isTreat).length} κεράσματα</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button className="font-medium" onClick={onCardDiscountIncrease} variant="outline">
              <Tag className="mr-1.5 h-4 w-4" />
              Κουπόνι
            </Button>

            <Button
              className="font-medium"
              disabled={loading || orderItems.length === 0}
              onClick={onPayment}
              variant="default"
            >
              <SALES_ICONS.EURO className="mr-1.5 h-4 w-4" />
              Πληρωμή
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
CartSection.displayName = 'CartSection';

// ------------------------------------------------------------
// Main Component
// ------------------------------------------------------------

export default function NewSaleInterface({ open, onOpenChange }: NewSaleInterfaceProps) {
  // State and hooks
  const {
    codes,
    filteredCodes,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    orderItems,
    loading,
    finalTotal,
    cardDiscountCount,
    subtotal,
    categoriesMap,
    categories,
    setSearchQuery,
    setSelectedCategory,
    setSelectedSubcategory,
    setCardDiscountCount,
    fetchCodes,
    removeItem,
    toggleTreat,
    increaseDosage,
    handlePayment,
    setOrderItems,
  } = useSales();

  const [activeView, setActiveView] = useState<'categories' | 'products' | 'cart'>('products');
  const isMobile = useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT}px)`);

  // Fetch data when dialog opens
  useEffect(() => {
    if (open && !codes.length) {
      fetchCodes();
    }
  }, [open, fetchCodes, codes.length]);

  // Filter codes by category/subcategory
  const displayedCodes = useMemo(() => {
    if (!selectedCategory) {
      return filteredCodes;
    }

    return filteredCodes.filter((code) => {
      if (selectedSubcategory) {
        return code.category?.name === selectedSubcategory;
      }

      const categoryId = codes.find((c) => c.category?.name === selectedCategory)?.category?.id;

      if (!categoryId) {
        return false;
      }

      const subcats = categoriesMap[categoryId] ?? [];
      return (
        code.category?.name === selectedCategory ||
        subcats.some((subcat) => subcat.name === code.category?.name)
      );
    });
  }, [filteredCodes, selectedCategory, selectedSubcategory, codes, categoriesMap]);

  // Event handlers
  const handleAddProduct = useCallback(
    (code: SalesCode) => {
      setOrderItems((prev: CartItem[]) => {
        // If the same product exists, increase quantity; else append new
        const index = prev.findIndex((i) => i.code.id === code.id);
        if (index >= 0) {
          const next: CartItem[] = [...prev];
          const current = next[index];
          if (!current) {
            return prev;
          }
          const updated: CartItem = {
            ...current,
            quantity: current.quantity + 1,
          };
          next[index] = updated;
          return next;
        }
        return [
          ...prev,
          {
            id: uuidv4(),
            code,
            quantity: 1,
            isTreat: false,
            ...(code.category?.name === 'Καφέδες & Ροφήματα' ? { dosageCount: 1 } : {}),
          },
        ];
      });
    },
    [setOrderItems]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [setSearchQuery]
  );

  const handleCategorySelect = useCallback(
    (category: string | null) => {
      setSelectedCategory(category);
      setSelectedSubcategory(null);
      if (isMobile) {
        setActiveView('products');
      }
    },
    [setSelectedCategory, setSelectedSubcategory, isMobile]
  );

  const handleSubcategorySelect = useCallback(
    (subcategory: string) => {
      setSelectedSubcategory(subcategory);
      if (isMobile) {
        setActiveView('products');
      }
    },
    [setSelectedSubcategory, isMobile]
  );

  const handleCashPayment = useCallback(() => {
    handlePayment('cash');
  }, [handlePayment]);

  // Render mobile view
  const renderMobileView = () => {
    switch (activeView) {
      case 'categories':
        return (
          <CategorySection
            categories={categories}
            categoriesMap={categoriesMap}
            codes={codes}
            isMobile={true}
            onCategorySelect={handleCategorySelect}
            onClose={() => setActiveView('products')}
            onSubcategorySelect={handleSubcategorySelect}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
          />
        );

      case 'products':
        return (
          <ProductSection
            cartItemsCount={orderItems.length}
            codes={displayedCodes}
            isMobile={true}
            onProductSelect={handleAddProduct}
            onSearchChange={handleSearchChange}
            onShowCart={() => setActiveView('cart')}
            onShowCategories={() => setActiveView('categories')}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            {...(selectedCategory ? { title: selectedCategory } : {})}
          />
        );

      case 'cart':
        return (
          <div className="h-full w-full">
            <CartSection
              cardDiscountCount={cardDiscountCount}
              finalTotal={finalTotal}
              isMobile={true}
              loading={loading}
              onCardDiscountIncrease={() => setCardDiscountCount((prev) => prev + 1)}
              onCardDiscountReset={() => setCardDiscountCount(0)}
              onDosageIncrease={increaseDosage}
              onPayment={handleCashPayment}
              onRemove={removeItem}
              onShowProducts={() => setActiveView('products')}
              onTreatToggle={toggleTreat}
              orderItems={orderItems}
              subtotal={subtotal}
            />
          </div>
        );
      default:
        return null;
    }
  };

  // Main render
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="h-screen w-screen max-w-full overflow-hidden rounded-none border-0 p-0">
        <DialogHeader className="shrink-0 border-b px-4 py-3">
          <DialogTitle className="font-bold text-xl">Νέα Παραγγελία</DialogTitle>
        </DialogHeader>

        <div className="flex h-[calc(100vh-64px)] flex-1 overflow-hidden">
          {isMobile ? (
            // Mobile layout - show one section at a time
            renderMobileView()
          ) : (
            // Desktop layout - three-column display
            <>
              {/* Left column - Categories */}
              <div className="h-full w-64 shrink-0 border-r">
                <CategorySection
                  categories={categories}
                  categoriesMap={categoriesMap}
                  codes={codes}
                  onCategorySelect={handleCategorySelect}
                  onSubcategorySelect={handleSubcategorySelect}
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                />
              </div>

              {/* Middle column - Products */}
              <div className="h-full flex-1">
                <ProductSection
                  cartItemsCount={orderItems.length}
                  codes={displayedCodes}
                  onProductSelect={handleAddProduct}
                  onSearchChange={handleSearchChange}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  {...(selectedCategory ? { title: selectedCategory } : {})}
                />
              </div>

              {/* Right column - Cart */}
              <div className="h-full w-96 shrink-0 border-l">
                <CartSection
                  cardDiscountCount={cardDiscountCount}
                  finalTotal={finalTotal}
                  loading={loading}
                  onCardDiscountIncrease={() => setCardDiscountCount((prev) => prev + 1)}
                  onCardDiscountReset={() => setCardDiscountCount(0)}
                  onDosageIncrease={increaseDosage}
                  onPayment={handleCashPayment}
                  onRemove={removeItem}
                  onTreatToggle={toggleTreat}
                  orderItems={orderItems}
                  subtotal={subtotal}
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
