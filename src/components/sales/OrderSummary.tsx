'use client';

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatCurrency } from "@/lib/utils"
import { Minus, Plus, Trash2, Gift } from "lucide-react"
import type { OrderSummaryProps } from "@/types"

export function OrderSummary({
  items,
  couponsCount,
  onRemoveItem,
  onToggleTreat,
  onAddCoupon,
  onRemoveCoupon,
  onCompleteSale,
}: OrderSummaryProps) {
  const subtotal = items.reduce(
    (total, item) => total + (item.is_treat_selected ? 0 : item.price),
    0
  )

  const couponDiscount = couponsCount * 2
  const total = Math.max(0, subtotal - couponDiscount)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Order Summary</h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        {items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            No items in order
          </p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.orderId}
                className="flex items-center justify-between space-x-2"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.orderId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {item.is_treat_selected
                        ? "€0.00"
                        : formatCurrency(item.price)}
                    </span>
                    <Button
                      variant={item.is_treat_selected ? "default" : "ghost"}
                      size="sm"
                      onClick={() => onToggleTreat(item.orderId)}
                    >
                      <Gift className="mr-2 h-4 w-4" />
                      Treat
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
      <div className="border-t p-4">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <span className="font-medium">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Coupons ({couponsCount})</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onRemoveCoupon}
                disabled={couponsCount === 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span>{formatCurrency(couponDiscount)}</span>
              <Button variant="ghost" size="icon" onClick={onAddCoupon}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between border-t pt-1.5">
            <span className="text-lg font-bold">Total</span>
            <span className="text-lg font-bold">{formatCurrency(total)}</span>
          </div>
          <Button
            className="mt-4 w-full"
            size="lg"
            onClick={onCompleteSale}
            disabled={items.length === 0}
          >
            Complete Sale
          </Button>
        </div>
      </div>
    </div>
  )
} 