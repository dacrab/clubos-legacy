import { Pencil, X } from 'lucide-react';

import type { Order, RegisterClosing, RegisterSession } from '@/types/register';
import { CARD_DISCOUNT } from '@/lib/constants';
import { cn, formatPrice } from '@/lib/utils';
import { calculateProductSummary, calculateTransactionTotals } from '@/lib/utils/registerUtils';
import { Card, CardContent } from '@/components/ui/card';

interface ClosingDetailsProps {
  session: RegisterSession;
  closing: RegisterClosing | null;
  orders?: Order[];
}

export function ClosingDetails({ session, closing, orders }: ClosingDetailsProps) {
  // Calculate on server side - no need for useMemo in server component
  const productSummary = calculateProductSummary(orders);
  const totals = calculateTransactionTotals(orders);

  const cardDiscountAmount = totals.cardDiscounts * CARD_DISCOUNT;
  const finalAmount = Math.max(0, totals.totalBeforeDiscounts - cardDiscountAmount);
  const notes = (closing?.notes || session.notes) as string;

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Transaction Summary */}
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 font-semibold">Σύνοψη Συναλλαγών</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Συνολικό Ποσό:</span>
                <span className="font-medium">{formatPrice(totals.totalBeforeDiscounts)}</span>
              </div>
              {totals.cardDiscounts > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Κουπόνια ({totals.cardDiscounts}x):</span>
                  <span className="font-medium text-red-500">
                    -{formatPrice(cardDiscountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Τελικό Ποσό:</span>
                <span className="font-medium">{formatPrice(finalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Κεράσματα:</span>
                <div className="text-right">
                  <span className="font-medium">{totals.treats}x</span>
                  {totals.treats > 0 && (
                    <span className="block text-xs text-amber-500">
                      {formatPrice(totals.treatsAmount)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-3 font-semibold">Αναλυτικά Προϊόντα</h3>
            <div className="max-h-[200px] overflow-y-auto">
              <div className="space-y-3 pr-4">
                {Object.values(productSummary)
                  .sort((a, b) => (a.isDeleted === b.isDeleted ? 0 : a.isDeleted ? 1 : -1))
                  .map(product => (
                    <div
                      key={product.id}
                      className={cn(
                        'flex items-start justify-between',
                        product.isDeleted && 'opacity-75'
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            className={cn(
                              'font-medium',
                              product.isDeleted && 'text-muted-foreground line-through'
                            )}
                          >
                            {product.name}
                          </p>
                          {product.isEdited && !product.isDeleted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-500">
                              <Pencil className="h-3 w-3" />
                              Επεξεργάσθηκε
                            </span>
                          )}
                          {product.isDeleted && (
                            <span className="bg-destructive/10 text-destructive inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs">
                              <X className="h-3 w-3" />
                              Διαγράφηκε
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {product.quantity}x
                          {product.treatCount > 0 && (
                            <span className="text-amber-500"> ({product.treatCount}x κέρασμα)</span>
                          )}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'font-medium tabular-nums',
                          product.isDeleted && 'text-muted-foreground line-through'
                        )}
                      >
                        {formatPrice(product.totalAmount)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {notes && (
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 font-semibold">Σημειώσεις</h3>
            <p className="text-muted-foreground">{notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
