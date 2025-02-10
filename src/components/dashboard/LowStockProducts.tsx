import { cn, formatCurrency } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Product } from "@/types"

interface LowStockProductsProps extends React.HTMLAttributes<HTMLDivElement> {
  products: Product[] | null
}

export function LowStockProducts({
  products,
  className,
}: LowStockProductsProps) {
  if (!products?.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Low Stock Products</CardTitle>
          <CardDescription>No products with low stock</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Low Stock Products</CardTitle>
        <CardDescription>Products with stock less than 10</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {products.map((product) => (
            <div key={product.id} className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {product.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {product.stock} in stock
                </p>
              </div>
              <div className="ml-auto font-medium">
                {formatCurrency(product.price)}
              </div>
              <div className="ml-2">
                <span
                  className={cn(
                    "rounded-full px-2 py-1 text-xs font-medium",
                    product.stock === 0
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  )}
                >
                  {product.stock === 0 ? "Out of Stock" : "Low Stock"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 