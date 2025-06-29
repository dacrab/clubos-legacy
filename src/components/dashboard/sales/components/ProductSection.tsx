"use client";

import { memo } from "react";
import { Menu, Search, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/types/sales";

interface ProductSectionProps {
    products: Product[];
    title?: string;
    onProductSelect: (product: Product) => void;
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onShowCategories?: () => void;
    onShowCart?: () => void;
    cartItemsCount: number;
    isMobile?: boolean;
    selectedCategory?: string | null;
    selectedSubcategory?: string | null;
}

const ProductGrid = memo(({
    products,
    onProductSelect
}: {
    products: Product[];
    onProductSelect: (product: Product) => void;
}) => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2">
        {products.map(product => (
            <ProductCard
                key={product.id}
                product={product}
                onClick={() => onProductSelect(product)}
            />
        ))}
        {products.length === 0 && (
            <div className="col-span-full text-center py-10">
                <div className="text-muted-foreground">Δεν βρέθηκαν προϊόντα</div>
            </div>
        )}
    </div>
));
ProductGrid.displayName = 'ProductGrid';


const ProductSection = memo(({
    products,
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
            <div className="flex items-center gap-2 p-3 border-b flex-shrink-0">
                {isMobile && onShowCategories && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 flex-shrink-0"
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
                <ProductGrid products={products} onProductSelect={onProductSelect} />
            </ScrollArea>
        </div>
    );
});
ProductSection.displayName = 'ProductSection';

export { ProductSection }; 