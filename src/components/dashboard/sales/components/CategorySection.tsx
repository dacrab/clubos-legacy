"use client";

import { memo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Category, Product } from "@/types/sales";

interface CategorySectionProps {
    categories: Category[];
    categoriesMap: Record<string, any[]>;
    selectedCategory: Category | null;
    selectedSubcategory: Category | null;
    onCategorySelect: (category: Category | null) => void;
    onSubcategorySelect: (name: Category) => void;
    onClose?: () => void;
    products: Product[];
    isMobile?: boolean;
}

const CategoryButton = memo(({
    category,
    isSelected,
    onClick
}: {
    category: Category | null;
    isSelected: boolean;
    onClick: () => void;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "w-full px-3 py-2 rounded-md text-sm font-medium transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            isSelected
                ? "bg-primary text-primary-foreground shadow-sm"
                : "hover:bg-muted/80 text-foreground"
        )}
    >
        {category?.name || 'Όλα τα προϊόντα'}
    </button>
));
CategoryButton.displayName = 'CategoryButton';

const SubcategoryButton = memo(({
    subcategory,
    isSelected,
    onClick
}: {
    subcategory: Category;
    isSelected: boolean;
    onClick: () => void;
}) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            "w-full text-left px-3 py-1.5 rounded-md text-sm",
            "transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            isSelected
                ? "text-primary bg-primary/10 font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
        )}
    >
        <span className="ml-2">↳ {subcategory.name}</span>
    </button>
));
SubcategoryButton.displayName = 'SubcategoryButton';


const CategorySection = memo(({
    categories,
    categoriesMap,
    selectedCategory,
    selectedSubcategory,
    onCategorySelect,
    onSubcategorySelect,
    onClose,
    products,
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
                        <div key={category.id} className="space-y-1 mb-3">
                            <CategoryButton
                                category={category}
                                isSelected={selectedCategory?.id === category.id}
                                onClick={() => onCategorySelect(category)}
                            />

                            {selectedCategory?.id === category.id && (
                                <div className="ml-2 space-y-1 mt-1">
                                    {categoriesMap[category.id]?.map(subcat => (
                                        <SubcategoryButton
                                            key={subcat.id}
                                            subcategory={subcat}
                                            isSelected={selectedSubcategory?.id === subcat.id}
                                            onClick={() => onSubcategorySelect(subcat)}
                                        />
                                    ))}
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

export { CategorySection }; 