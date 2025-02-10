import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface CategorySelectorProps {
  categories: string[]
  subcategories: string[]
  selectedCategory: string | null
  selectedSubcategory: string | null
  onSelectCategory: (category: string | null) => void
  onSelectSubcategory: (subcategory: string | null) => void
}

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
          <div key={category} className="space-y-1">
            <Button
              variant="ghost"
              className={cn(
                "justify-start",
                selectedCategory === category && "bg-accent text-accent-foreground"
              )}
              onClick={() => {
                onSelectCategory(category)
                onSelectSubcategory(null)
              }}
            >
              {category}
            </Button>
            {selectedCategory === category && subcategories.length > 0 && (
              <div className="ml-4 flex flex-col gap-1">
                <Button
                  key={`all-${category}`}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "justify-start",
                    !selectedSubcategory && "bg-muted text-muted-foreground"
                  )}
                  onClick={() => onSelectSubcategory(null)}
                >
                  All {category}
                </Button>
                {subcategories.map((subcategory) => (
                  <Button
                    key={`${category}-${subcategory}`}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "justify-start",
                      selectedSubcategory === subcategory &&
                        "bg-muted text-muted-foreground"
                    )}
                    onClick={() => onSelectSubcategory(subcategory)}
                  >
                    {subcategory}
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