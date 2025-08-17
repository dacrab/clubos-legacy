"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/types/sales";

interface CategorySectionProps {
    categories: Category[];
    categoriesMap: Record<string, Category[]>;
    selectedCategory: Category | null;
    selectedSubcategory: Category | null;
    onCategorySelect: (category: Category | null) => void;
    onSubcategorySelect: (subcategory: Category) => void;
    onClose?: () => void;
    products: Product[];
    isMobile?: boolean;
}

const CategorySection = ({
    categories,
    categoriesMap,
    selectedCategory,
    selectedSubcategory,
    onCategorySelect,
    onSubcategorySelect,
    onClose,
    isMobile
}: CategorySectionProps) => {
    const isSelected = (categoryId: string | null) => {
        return selectedCategory?.id === categoryId;
    };

    const isSubcategorySelected = (subcategoryId: string) => {
        return selectedSubcategory?.id === subcategoryId;
    };

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
                    <button
                        type="button"
                        onClick={() => onCategorySelect(null)}
                        className={cn(
                            "w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
                            !selectedCategory
                                ? "bg-primary text-primary-foreground shadow-xs"
                                : "hover:bg-muted/80 text-foreground"
                        )}
                    >
                        Όλα τα προϊόντα
                    </button>

                    {categories.map(category => (
                        <div key={category.id} className="space-y-1 mb-3">
                            <button
                                type="button"
                                onClick={() => onCategorySelect(category)}
                                className={cn(
                                    "w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
                                    isSelected(category.id)
                                        ? "bg-primary text-primary-foreground shadow-xs"
                                        : "hover:bg-muted/80 text-foreground"
                                )}
                            >
                                {category.name}
                            </button>

                            {isSelected(category.id) && categoriesMap[category.id] && (
                                <div className="ml-2 space-y-1 mt-1">
                                    {categoriesMap[category.id].map(subcategory => (
                                        <button
                                            key={subcategory.id}
                                            type="button"
                                            onClick={() => onSubcategorySelect(subcategory)}
                                            className={cn(
                                                "w-full text-left px-3 py-1.5 rounded-md text-sm",
                                                "transition-colors duration-200",
                                                "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
                                                isSubcategorySelected(subcategory.id)
                                                    ? "text-primary bg-primary/10 font-medium"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                            )}
                                        >
                                            <span className="ml-2">↳ {subcategory.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};
export { CategorySection }; 