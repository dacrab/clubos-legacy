import { Package } from "lucide-react";
import Image from "next/image";


import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/types/products";

interface LowStockCardProps {
  product: Product;
}

export default function LowStockCard({ product }: LowStockCardProps) {
  const getStockVariant = (stock: number) => {
    if (stock <= 5) {return "destructive";}
    if (stock <= 10) {return "secondary";}
    return "outline";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex items-center justify-center shrink-0">
            {product.imageUrl ? (
              <Image
                  src={product.imageUrl}
                  alt={product.name}
                width={48}
                height={48}
                  className="object-contain"
                />
            ) : (
              <Package className="h-6 w-6 text-muted-foreground" />
            )}
            </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{product.name}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {product.category?.name || 'Χωρίς κατηγορία'}
            </p>
          </div>
          
          <div className="text-right shrink-0">
            <Badge variant={getStockVariant(product.stock)}>
              {product.stock} τεμ.
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">
              {parseFloat(product.price).toFixed(2)}€
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}