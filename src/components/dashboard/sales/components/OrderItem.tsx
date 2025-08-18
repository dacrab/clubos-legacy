'use client';

import * as React from 'react';
import { Coffee, Euro, Gift, Trash2 } from 'lucide-react';

import type { OrderItem as OrderItemType } from '@/types/sales';
import { EXTRA_SHOT_PRICE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/ui/product-image';

interface OrderItemProps {
  item: OrderItemType;
  onRemove: (itemId: string) => void;
  onTreatToggle: (itemId: string) => void;
  onDosageIncrease: (itemId: string) => void;
  subtotal: number;
  cardDiscountCount: number;
}

export function OrderItem({ item, onRemove, onTreatToggle, onDosageIncrease }: OrderItemProps) {
  if (!item.product) {
    return null;
  }

  const { product, id, isTreat, dosageCount = 1 } = item;
  const { category, imageUrl, price } = product;

  const dosageExtra = dosageCount > 1 ? (dosageCount - 1) * EXTRA_SHOT_PRICE : 0;
  const itemTotal = ((parseFloat(price) || 0) + dosageExtra) * item.quantity;
  const isHotDrink = category?.name === 'Καφέδες & Ροφήματα';

  return (
    <div
      className={cn(
        'bg-card mb-3 flex w-full rounded-md border shadow-xs',
        isTreat && 'bg-primary/5 border-primary/20'
      )}
    >
      <div className="flex flex-1 items-center gap-3 p-3">
        {imageUrl ? (
          <ProductImage
            src={imageUrl}
            alt={product.name}
            size="sm"
            className="h-12 w-12 shrink-0 rounded-md"
          />
        ) : (
          <div className="bg-primary/5 flex h-12 w-12 shrink-0 items-center justify-center rounded-md">
            <span className="text-primary text-sm font-bold">
              {product.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-bold">
            {product.name}
            {dosageCount > 1 && (
              <span className="text-primary ml-1 text-xs font-bold">(x{dosageCount})</span>
            )}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-sm">
            <Euro className="h-3.5 w-3.5" />
            <span className="font-bold">{isTreat ? '0.00' : itemTotal.toFixed(2)}€</span>
          </div>
        </div>
      </div>

      <div className="bg-muted/5 flex flex-col gap-1 border-l p-2">
        {isHotDrink && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'text-muted-foreground hover:text-primary-foreground hover:bg-primary h-10 px-3',
              dosageCount > 1 && 'bg-primary/10 text-primary'
            )}
            onClick={() => onDosageIncrease(id)}
          >
            <Coffee className="h-4 w-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'text-muted-foreground hover:text-primary-foreground hover:bg-primary h-10 px-3',
            isTreat && 'bg-primary/10 text-primary'
          )}
          onClick={() => onTreatToggle(id)}
        >
          <Gift className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive-foreground hover:bg-destructive h-10 px-3"
          onClick={() => onRemove(id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
