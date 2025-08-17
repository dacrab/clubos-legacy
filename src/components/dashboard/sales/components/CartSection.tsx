"use client";

import { ChevronLeft, X, ShoppingCart, Tag, Gift } from "lucide-react";
import { memo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SALES_ICONS } from "@/lib/constants";
import type { OrderItem as OrderItemType } from "@/types/sales";

import { OrderItem } from "./OrderItem";

interface CartSectionProps {
  orderItems: OrderItemType[];
  onRemove: (id: string) => void;
  onTreatToggle: (id: string) => void;
  onDosageIncrease: (id: string) => void;
  subtotal: number;
  treatsValue: number;
  finalTotal: number;
  cardDiscountCount: number;
  onCardDiscountIncrease: () => void;
  onCardDiscountDecrease: () => void;
  onCardDiscountReset: () => void;
  onPayment: () => void;
  loading: boolean;
  onShowProducts?: () => void;
  isMobile?: boolean;
}

const CartSection = memo(({
  orderItems,
  onRemove,
  onTreatToggle,
  onDosageIncrease,
  subtotal,
  treatsValue,
  finalTotal,
  cardDiscountCount,
  onCardDiscountIncrease,
  onCardDiscountDecrease,
  onCardDiscountReset,
  onPayment,
  loading,
  onShowProducts,
  isMobile
}: CartSectionProps) => {
  const treatCount = orderItems.filter(item => item.isTreat).length;
  const hasItems = orderItems.length > 0;
  const discountAmount = cardDiscountCount * 2;

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          {isMobile && onShowProducts && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onShowProducts}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <h3 className="font-bold">Παραγγελία</h3>
        </div>
        <Badge variant="outline">{orderItems.length} προϊόντα</Badge>
      </div>

      {/* Items List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {hasItems ? (
            orderItems.map(item => (
              <OrderItem
                key={item.id}
                item={item}
                onRemove={onRemove}
                onTreatToggle={onTreatToggle}
                onDosageIncrease={onDosageIncrease}
                subtotal={subtotal}
                cardDiscountCount={cardDiscountCount}
              />
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>Δεν έχουν προστεθεί προϊόντα</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Summary */}
      <div className="border-t p-3 space-y-3 bg-background">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Υποσύνολο:</span>
            <span>{subtotal.toFixed(2)}€</span>
          </div>

          {treatsValue > 0 && (
            <div className="flex justify-between text-sm text-amber-500">
              <span>Κεράσματα ({treatCount}x):</span>
              <span>Δωρεάν ({treatsValue.toFixed(2)}€)</span>
            </div>
          )}

          {cardDiscountCount > 0 && (
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Κουπόνι:</span>
                <Badge variant="outline" className="text-xs">x{cardDiscountCount}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 text-destructive"
                  onClick={onCardDiscountDecrease}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <span className="text-destructive">-{discountAmount.toFixed(2)}€</span>
            </div>
          )}

          <div className="flex justify-between font-bold text-base pt-1">
            <span>Σύνολο:</span>
            <span>{finalTotal.toFixed(2)}€</span>
          </div>

          <div className="flex justify-between text-xs mt-1">
            {treatCount > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Gift className="h-3.5 w-3.5" />
                <span>{treatCount} κεράσματα</span>
              </div>
            )}
            {cardDiscountCount > 0 && (
              <Button
                variant="link"
                className="p-0 h-auto text-xs text-destructive"
                onClick={onCardDiscountReset}
              >
                Καθαρισμός κουπονιών
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={onCardDiscountIncrease}>
            <Tag className="h-4 w-4 mr-1.5" />
            Κουπόνι
          </Button>
          <Button
            variant="default"
            onClick={onPayment}
            disabled={loading || !hasItems}
          >
            <SALES_ICONS.EURO className="h-4 w-4 mr-1.5" />
            Πληρωμή
          </Button>
        </div>
      </div>
    </div>
  );
});

CartSection.displayName = "CartSection";

export { CartSection };