import Image from 'next/image';
import { Package } from 'lucide-react';

import type { Product } from '@/types/products';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface LowStockCardProps {
  product: Product;
}

export default function LowStockCard({ product }: LowStockCardProps) {
  const getStockVariant = (stock: number) => {
    if (stock <= 5) {
      return 'destructive';
    }
    if (stock <= 10) {
      return 'secondary';
    }
    return 'outline';
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={48}
                height={48}
                className="object-contain"
              />
            ) : (
              <Package className="text-muted-foreground h-6 w-6" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-medium">{product.name}</h3>
            <p className="text-muted-foreground truncate text-sm">
              {product.category?.name || 'Χωρίς κατηγορία'}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <Badge variant={getStockVariant(product.stock)}>{product.stock} τεμ.</Badge>
            <p className="text-muted-foreground mt-1 text-sm">
              {parseFloat(product.price).toFixed(2)}€
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
