"use client";

import { Coffee, Gift, Trash2, Euro } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { EXTRA_SHOT_PRICE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { OrderItem as OrderItemType } from "@/types/sales";

interface OrderItemProps {
  item: OrderItemType;
  onRemove: (itemId: string) => void;
  onTreatToggle: (itemId: string) => void;
  onDosageIncrease: (itemId: string) => void;
  subtotal: number;
  cardDiscountCount: number;
}

export function OrderItem({ item, onRemove, onTreatToggle, onDosageIncrease }: OrderItemProps) {
  if (!item.product) {return null;}

  const { product, id, isTreat, dosageCount = 1 } = item;
  const { category, imageUrl, price } = product;

  const dosageExtra = dosageCount > 1 ? (dosageCount - 1) * EXTRA_SHOT_PRICE : 0;
  const itemTotal = ((parseFloat(price) || 0) + dosageExtra) * item.quantity;
  const isHotDrink = category?.name === "Καφέδες & Ροφήματα";

  return (
    <div className={cn(
      "flex rounded-md border bg-card shadow-xs mb-3 w-full",
        isTreat && "bg-primary/5 border-primary/20"
    )}>
      <div className="flex-1 p-3 flex items-center gap-3">
            {imageUrl ? (
              <ProductImage
                src={imageUrl}
                alt={product.name}
                size="sm"
            className="h-12 w-12 rounded-md shrink-0"
              />
            ) : (
          <div className="h-12 w-12 flex items-center justify-center rounded-md bg-primary/5 shrink-0">
            <span className="text-sm font-bold text-primary">
              {product.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
                )}
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold line-clamp-2">
            {product.name}
            {dosageCount > 1 && (
              <span className="ml-1 text-xs text-primary font-bold">
                (x{dosageCount})
              </span>
          )}
          </h3>
          <div className="flex items-center gap-1 text-sm mt-1">
            <Euro className="h-3.5 w-3.5" />
            <span className="font-bold">
              {isTreat ? '0.00' : itemTotal.toFixed(2)}€
            </span>
        </div>
      </div>
    </div>

      <div className="flex flex-col gap-1 p-2 border-l bg-muted/5">
        {isHotDrink && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-10 px-3 text-muted-foreground hover:text-primary-foreground hover:bg-primary",
              dosageCount > 1 && "bg-primary/10 text-primary"
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
            "h-10 px-3 text-muted-foreground hover:text-primary-foreground hover:bg-primary",
            isTreat && "bg-primary/10 text-primary"
          )}
          onClick={() => onTreatToggle(id)}
        >
          <Gift className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-10 px-3 text-destructive hover:text-destructive-foreground hover:bg-destructive"
          onClick={() => onRemove(id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}