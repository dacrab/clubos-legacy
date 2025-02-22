import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { CategorySelectorProps } from "@/types/app"

export function CategorySelector({
  categories,
  subcategories,
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
  onSelectSubcategory,
}: CategorySelectorProps) {
  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-1 p-4">
        <h3 className="mb-2 text-lg font-semibold">Categories</h3>
        <Button
          key="all-products"
          variant="ghost"
          className={cn(
            "justify-start",
            !selectedCategory && "bg-accent text-accent-foreground"
          )}
          onClick={() => {
            onSelectCategory(null)
            onSelectSubcategory(null)
          }}
        >
          All Products
        </Button>
        {categories.map((category) => (
          <div key={category.id} className="space-y-1">
            <Button
              variant="ghost"
              className={cn(
                "justify-start",
                selectedCategory === category.id && "bg-accent text-accent-foreground"
              )}
              onClick={() => {
                onSelectCategory(category.id)
                onSelectSubcategory(null)
              }}
            >
              {category.name}
            </Button>
            {selectedCategory === category.id && subcategories.length > 0 && (
              <div className="ml-4 flex flex-col gap-1">
                <Button
                  key={`${category.id}-all`}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start",
                    !selectedSubcategory && "bg-muted text-muted-foreground"
                  )}
                  onClick={() => onSelectSubcategory(null)}
                >
                  All {category.name}
                </Button>
                {subcategories.map((subcategory) => (
                  <Button
                    key={`${category.id}-${subcategory.id}`}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start",
                      selectedSubcategory === subcategory.id &&
                        "bg-muted text-muted-foreground"
                    )}
                    onClick={() => onSelectSubcategory(subcategory.id)}
                  >
                    {subcategory.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
} 