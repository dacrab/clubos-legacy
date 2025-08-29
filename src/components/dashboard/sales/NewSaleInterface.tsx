"use client";

import { X, Search, ShoppingCart, Gift, Menu, ChevronLeft, Tag } from "lucide-react";
import { useState, useMemo, useEffect, useCallback, memo } from "react";
import { v4 as uuidv4 } from 'uuid';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSales } from "@/hooks/useSales";
import { SALES_ICONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Code, OrderItem as OrderItemType } from "@/types/sales";

import { OrderItem } from "./components/OrderItem";
import { ProductCard } from "./components/ProductCard";

// ------------------------------------------------------------
// Type Definitions
// ------------------------------------------------------------

interface NewSaleInterfaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CategorySectionProps {
  categories: string[];
  categoriesMap: Partial<Record<string, any[]>>;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onCategorySelect: (category: string | null) => void;
  onSubcategorySelect: (name: string) => void;
  onClose?: () => void;
  codes: Code[];
  isMobile?: boolean;
}

interface ProductSectionProps {
  codes: Code[];
  title?: string;
  onProductSelect: (code: Code) => void;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShowCategories?: () => void;
  onShowCart?: () => void;
  cartItemsCount: number;
  isMobile?: boolean;
  selectedCategory?: string | null;
  selectedSubcategory?: string | null;
}

interface CartSectionProps {
  orderItems: OrderItemType[];
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
}

// ------------------------------------------------------------
// Helper Components
// ------------------------------------------------------------

const CategoryButton = memo(({ 
  category, 
  isSelected, 
  onClick 
}: { 
  category: string | null;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
      "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
      isSelected 
        ? "bg-primary text-primary-foreground shadow-xs" 
        : "hover:bg-muted/80 text-foreground"
    )}
  >
    {category || 'Όλα τα προϊόντα'}
  </button>
));
CategoryButton.displayName = 'CategoryButton';

const SubcategoryButton = memo(({ 
  name, 
  isSelected, 
  onClick 
}: { 
  name: string;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "w-full text-left px-3 py-1.5 rounded-md text-sm",
      "transition-colors duration-200",
      "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
      isSelected
        ? "text-primary bg-primary/10 font-medium"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
    )}
  >
    <span className="ml-2">↳ {name}</span>
  </button>
));
SubcategoryButton.displayName = 'SubcategoryButton';

// ------------------------------------------------------------
// Main Section Components 
// ------------------------------------------------------------

const CategorySection = memo(({
  categories,
  categoriesMap,
  selectedCategory,
  selectedSubcategory,
  onCategorySelect,
  onSubcategorySelect,
  onClose,
  codes,
  isMobile
}: CategorySectionProps) => {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {isMobile && (
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-bold text-base">Κατηγορίες</h3>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
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
          
          {categories.map(category => (
            <div key={category} className="space-y-1 mb-3">
              <CategoryButton 
                category={category}
                isSelected={selectedCategory === category}
                onClick={() => onCategorySelect(category)}
              />
              
              {selectedCategory === category && (
                <div className="ml-2 space-y-1 mt-1">
                  {(() => {
                    const foundCode = codes.find(code => code.category?.name === category);
                    if (foundCode?.category) {
                      const subcats = categoriesMap[foundCode.category.id];
                      return subcats?.map(subcat => (
                        <SubcategoryButton 
                          key={subcat.id}
                          name={subcat.name}
                          isSelected={selectedSubcategory === subcat.name}
                          onClick={() => onSubcategorySelect(subcat.name)}
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
});
CategorySection.displayName = 'CategorySection';

const ProductGrid = memo(({ 
  codes, 
  onProductSelect 
}: { 
  codes: Code[]; 
  onProductSelect: (code: Code) => void;
}) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2">
    {codes.map(code => (
      <ProductCard 
        key={code.id} 
        code={code} 
        onClick={() => onProductSelect(code)} 
      />
    ))}
    {codes.length === 0 && (
      <div className="col-span-full text-center py-10">
        <div className="text-muted-foreground">Δεν βρέθηκαν προϊόντα</div>
      </div>
    )}
  </div>
));
ProductGrid.displayName = 'ProductGrid';

const ProductSection = memo(({
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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b shrink-0">
        {isMobile && onShowCategories && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 shrink-0"
            onClick={onShowCategories}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Αναζήτηση προϊόντων..."
            value={searchQuery}
            onChange={onSearchChange}
            className="pl-9 h-10 w-full"
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
              onClick={() => onSearchChange({ target: { value: '' } } as any)}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </Button>
          )}
        </div>
        
        {isMobile && onShowCart && (
          <Button 
            variant="default" 
            size="sm"
            onClick={onShowCart}
            className="flex items-center gap-1.5 h-10"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="font-medium">{cartItemsCount}</span>
          </Button>
        )}
      </div>
      
      {title && (
        <div className="px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          {selectedCategory && selectedSubcategory && (
            <Badge variant="outline" className="font-normal">
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
});
ProductSection.displayName = 'ProductSection';

const CartSection = memo(({
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
  isMobile
}: CartSectionProps) => {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-card w-full">
      <div className="flex items-center justify-between p-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          {isMobile && onShowProducts && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={onShowProducts}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h3 className="font-bold">Παραγγελία</h3>
        </div>
        
        <Badge variant="outline" className="font-medium">
          {orderItems.length} προϊόντα
        </Badge>
      </div>
      
      <ScrollArea className="flex-1 w-full">
        <div className="p-3 space-y-2 w-full">
          {orderItems.map(item => (
            <OrderItem
              key={item.id}
              item={item}
              onRemove={onRemove}
              onTreatToggle={onTreatToggle}
              onDosageIncrease={onDosageIncrease}
              subtotal={subtotal}
              cardDiscountCount={cardDiscountCount}
            />
          ))}
          
          {orderItems.length === 0 && (
            <div className="text-center py-10 text-muted-foreground w-full">
              <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>Δεν έχουν προστεθεί προϊόντα</p>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="border-t p-3 space-y-3 bg-background w-full">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Υποσύνολο:</span>
            <span>{subtotal.toFixed(2)}€</span>
          </div>
          
          {cardDiscountCount > 0 && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Κουπόνι:</span>
                <Badge variant="outline" className="text-xs">x{cardDiscountCount}</Badge>
                {cardDiscountCount > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-destructive rounded-full"
                    onClick={onCardDiscountReset}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <span className="text-destructive">-{(cardDiscountCount * 2).toFixed(2)}€</span>
            </div>
          )}
          
          <div className="flex items-center justify-between font-bold text-base pt-1">
            <span>Σύνολο:</span>
            <span>{finalTotal.toFixed(2)}€</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {orderItems.filter(item => item.isTreat).length > 0 && (
              <div className="flex items-center gap-1.5 mt-1">
                <Gift className="h-3.5 w-3.5" />
                <span>{orderItems.filter(item => item.isTreat).length} κεράσματα</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="font-medium"
            onClick={onCardDiscountIncrease}
          >
            <Tag className="h-4 w-4 mr-1.5" />
            Κουπόνι
          </Button>
          
          <Button
            variant="default"
            className="font-medium"
            onClick={onPayment}
            disabled={loading || orderItems.length === 0}
          >
            <SALES_ICONS.EURO className="h-4 w-4 mr-1.5" />
            Πληρωμή
          </Button>
        </div>
      </div>
    </div>
  );
});
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
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Fetch data when dialog opens
  useEffect(() => {
    if (open && !codes.length) {
      void fetchCodes();
    }
  }, [open, fetchCodes, codes.length]);
  
  // Filter codes by category/subcategory
  const displayedCodes = useMemo(() => {
    if (!selectedCategory) {return filteredCodes;}
    
    return filteredCodes.filter(code => {
      if (selectedSubcategory) {return code.category?.name === selectedSubcategory;}
      
      const categoryId = codes.find(c => 
        c.category?.name === selectedCategory
      )?.category?.id;
      
      if (!categoryId) {return false;}
      
      const subcats = categoriesMap[categoryId] ?? [];
      return (
        code.category?.name === selectedCategory ||
        subcats.some(subcat => 
          subcat.name === code.category?.name
        )
      );
    });
  }, [filteredCodes, selectedCategory, selectedSubcategory, codes, categoriesMap]);

  // Event handlers
  const handleAddProduct = useCallback((code: Code) => {
    setOrderItems(prev => [
      ...prev,
      {
        id: uuidv4(),
        code,
        codeId: code.id,
        quantity: 1,
        isTreat: false,
        dosageCount: code.category?.name === "Καφέδες & Ροφήματα" ? 1 : undefined
      }
    ]);
    
  }, [setOrderItems]);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);
  
  const handleCategorySelect = useCallback((category: string | null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    if (isMobile) {setActiveView('products');}
  }, [setSelectedCategory, setSelectedSubcategory, isMobile]);
  
  const handleSubcategorySelect = useCallback((subcategory: string) => {
    setSelectedSubcategory(subcategory);
    if (isMobile) {setActiveView('products');}
  }, [setSelectedSubcategory, isMobile]);
  
  const handleCashPayment = useCallback(() => {
    void handlePayment('cash');
  }, [handlePayment]);
  
  // Render mobile view
  const renderMobileView = () => {
    switch (activeView) {
      case 'categories':
        return (
          <CategorySection
            categories={categories}
            categoriesMap={categoriesMap}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategorySelect={handleCategorySelect}
            onSubcategorySelect={handleSubcategorySelect}
            onClose={() => setActiveView('products')}
            codes={codes}
            isMobile={true}
          />
        );
        
      case 'products':
        return (
          <ProductSection
            codes={displayedCodes}
            title={selectedCategory || undefined}
            onProductSelect={handleAddProduct}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onShowCategories={() => setActiveView('categories')}
            onShowCart={() => setActiveView('cart')}
            cartItemsCount={orderItems.length}
            isMobile={true}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
          />
        );
        
      case 'cart':
        return (
          <div className="w-full h-full">
            <CartSection
              orderItems={orderItems}
              onRemove={removeItem}
              onTreatToggle={toggleTreat}
              onDosageIncrease={increaseDosage}
              subtotal={subtotal}
              finalTotal={finalTotal}
              cardDiscountCount={cardDiscountCount}
              onCardDiscountIncrease={() => setCardDiscountCount(prev => prev + 1)}
              onCardDiscountReset={() => setCardDiscountCount(0)}
              onPayment={handleCashPayment}
              loading={loading}
              onShowProducts={() => setActiveView('products')}
              isMobile={true}
            />
          </div>
        );
    }
  };
  
  // Main render
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full w-screen h-screen p-0 overflow-hidden rounded-none border-0">
        <DialogHeader className="px-4 py-3 border-b shrink-0">
          <DialogTitle className="text-xl font-bold">Νέα Παραγγελία</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
          {isMobile ? (
            // Mobile layout - show one section at a time
            renderMobileView()
          ) : (
            // Desktop layout - three-column display
            <>
              {/* Left column - Categories */}
              <div className="w-64 border-r h-full shrink-0">
                <CategorySection
                  categories={categories}
                  categoriesMap={categoriesMap}
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  onCategorySelect={handleCategorySelect}
                  onSubcategorySelect={handleSubcategorySelect}
                  codes={codes}
                />
              </div>
              
              {/* Middle column - Products */}
              <div className="flex-1 h-full">
                <ProductSection
                  codes={displayedCodes}
                  title={selectedCategory || undefined}
                  onProductSelect={handleAddProduct}
                  searchQuery={searchQuery}
                  onSearchChange={handleSearchChange}
                  cartItemsCount={orderItems.length}
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                />
              </div>
              
              {/* Right column - Cart */}
              <div className="w-96 border-l h-full shrink-0">
                <CartSection
                  orderItems={orderItems}
                  onRemove={removeItem}
                  onTreatToggle={toggleTreat}
                  onDosageIncrease={increaseDosage}
                  subtotal={subtotal}
                  finalTotal={finalTotal}
                  cardDiscountCount={cardDiscountCount}
                  onCardDiscountIncrease={() => setCardDiscountCount(prev => prev + 1)}
                  onCardDiscountReset={() => setCardDiscountCount(0)}
                  onPayment={handleCashPayment}
                  loading={loading}
                />
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}