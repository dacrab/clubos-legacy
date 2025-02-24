import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import type { ProductGridProps } from "@/types/components"

export function ProductGrid({ products, onAddToOrder }: ProductGridProps) {
  if (!products?.length) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No products found</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <Button
            key={product.id}
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-3"
            onClick={() => onAddToOrder(product)}
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-lg">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <span className="text-sm text-muted-foreground">No image</span>
                </div>
              )}
            </div>
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <span className="line-clamp-2 text-sm font-medium">
                  {product.name}
                </span>
                <span className="shrink-0 text-sm font-medium text-muted-foreground">
                  {formatCurrency(product.price)}
                </span>
              </div>
              {product.stock < 10 && (
                <span
                  className={`mt-1 inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    product.stock === 0
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {product.stock === 0 ? "Out of Stock" : "Low Stock"}
                </span>
              )}
            </div>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}