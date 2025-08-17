"use client";

import { Menu, Search, X, ShoppingCart } from "lucide-react";
import { memo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Product } from "@/types/sales";

import { ProductCard } from "./ProductCard";

interface ProductSectionProps {
    products: Product[];
    title?: string;
    onProductSelect: (product: Product) => void;
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onShowCategories?: () => void;
    onShowCart?: () => void;
    cartItemsCount: number;
    isMobile?: boolean;
}

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
}: ProductSectionProps) => {
    const clearSearch = () => onSearchChange('');

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 p-3 border-b">
                {isMobile && onShowCategories && (
                    <Button variant="ghost" size="icon" onClick={onShowCategories}>
                        <Menu className="h-5 w-5" />
                    </Button>
                )}

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Αναζήτηση προϊόντων..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                            onClick={clearSearch}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {isMobile && onShowCart && (
                    <Button variant="default" size="sm" onClick={onShowCart}>
                        <ShoppingCart className="h-4 w-4" />
                        <span>{cartItemsCount}</span>
                    </Button>
                )}
            </div>

            {/* Title */}
            {title && (
                <div className="px-4 py-3">
                    <h2 className="text-lg font-bold">{title}</h2>
                </div>
            )}

            {/* Products */}
            <ScrollArea className="flex-1">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
                    {products.length > 0 ? (
                        products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => onProductSelect(product)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                            Δεν βρέθηκαν προϊόντα
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
});

ProductSection.displayName = 'ProductSection';

export { ProductSection };
