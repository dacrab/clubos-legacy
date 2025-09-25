import { Package } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';
import { cn } from '@/lib/utils/format';
import type { ProductWithCategory } from '@/types/database';
import StockManagementDialog from './stock-management-dialog';

const STOCK_PERCENTAGE = {
  CRITICAL: 30,
  WARNING: 60,
  FULL: 100,
};

type LowStockCardProps = {
  code: ProductWithCategory;
};

export default function LowStockCard({ code }: LowStockCardProps) {
  const stockValue = code.stock_quantity;
  const priceValue = code.price;
  const stockPercentage = (stockValue / LOW_STOCK_THRESHOLD) * STOCK_PERCENTAGE.FULL;
  const getStockColor = () => {
    if (stockPercentage <= STOCK_PERCENTAGE.CRITICAL) {
      return 'text-destructive bg-destructive/10 hover:bg-destructive/20';
    }
    if (stockPercentage <= STOCK_PERCENTAGE.WARNING) {
      return 'text-yellow-600 bg-yellow-100/80 hover:bg-yellow-100';
    }
    return 'text-primary bg-primary/10 hover:bg-primary/20';
  };

  const [open, setOpen] = React.useState(false);

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            {code.image_url ? (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-white sm:h-14 sm:w-14">
                <Image
                  alt={code.name}
                  className="object-contain"
                  fill
                  sizes="(max-width: 640px) 48px, 56px"
                  src={code.image_url}
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted sm:h-14 sm:w-14">
                <Package className="h-6 w-6 text-muted-foreground sm:h-7 sm:w-7" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground text-md sm:text-lg">{code.name}</p>
              <p className="truncate text-muted-foreground text-sm">
                {code.category?.name || 'Χωρίς κατηγορία'}
              </p>
            </div>
          </div>
          <div className="ml-3 flex shrink-0 flex-col items-end gap-2 text-right">
            <Badge
              className={cn(getStockColor(), 'px-3 py-1.5 text-sm sm:px-4 sm:text-md')}
              variant="outline"
            >
              {stockValue} τεμ.
            </Badge>
            <p className="text-muted-foreground text-sm">{priceValue.toFixed(2)}€</p>
            <button
              className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
              onClick={() => setOpen(true)}
              type="button"
            >
              Διαχείριση Αποθέματος
            </button>
          </div>
        </div>
      </CardContent>
      <StockManagementDialog code={code} onOpenChange={setOpen} open={open} />
    </Card>
  );
}
