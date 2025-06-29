"use client";

import { useMemo } from 'react';
import { Pencil, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CARD_DISCOUNT } from "@/lib/constants";
import { cn, formatPrice } from "@/lib/utils";
import { calculateProductSummary, calculateTransactionTotals } from "@/lib/utils/registerUtils";
import type { RegisterSession, RegisterClosing, Order, Sale, TransactionTotals, ProductSummary } from "@/types/register";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

// Types
interface ClosingDetailsProps {
  session: RegisterSession;
  closing: RegisterClosing | null;
  orders?: Order[];
}

// Component parts
const TransactionSummaryCard = ({ totals, closing }: { totals: TransactionTotals, closing: RegisterClosing | null }) => {
  const cardDiscountAmount = +(totals.cardDiscounts * CARD_DISCOUNT).toFixed(2);
  const finalAmount = Math.max(0, +(totals.totalBeforeDiscounts - cardDiscountAmount).toFixed(2));

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">Σύνοψη Συναλλαγών</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Συνολικό Ποσό:</span>
            <span className="font-medium">{formatPrice(totals.totalBeforeDiscounts)}</span>
          </div>
          {totals.cardDiscounts > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Κουπόνια ({totals.cardDiscounts}x):</span>
              <span className="font-medium text-red-500">-{formatPrice(cardDiscountAmount)}</span>
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
                <span className="text-xs text-green-500 block">
                  {formatPrice(totals.treatsAmount)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ProductDetailsCard = ({ productSummary }: { productSummary: Record<string, ProductSummary> }) => {
  const products = Object.values(productSummary);
  if (!products.length) return null;

  // Sort products - active items first, then deleted items
  const sortedProducts = products.sort((a, b) => 
    (a.isDeleted === b.isDeleted) ? 0 : a.isDeleted ? 1 : -1
  );

  // Check if we have both active and deleted items
  const hasActiveItems = sortedProducts.some(p => !p.isDeleted);
  const hasDeletedItems = sortedProducts.some(p => p.isDeleted);
  const shouldShowDivider = hasActiveItems && hasDeletedItems;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">Αναλυτικά Προϊόντα</h3>
        <div className="max-h-[200px] overflow-y-auto">
          <div className="space-y-3 pr-4">
            {sortedProducts.map((product, index) => {
              // Add a divider before the first deleted item
              const isFirstDeletedItem = shouldShowDivider && 
                product.isDeleted && 
                index > 0 && 
                !sortedProducts[index - 1].isDeleted;
              
              return (
                <div key={product.id}>
                  {isFirstDeletedItem && (
                    <div className="my-3 pt-2 border-t border-muted">
                      <p className="text-xs text-muted-foreground mb-2">Διαγραμμένα Προϊόντα</p>
                    </div>
                  )}
                  <div 
                    className={cn(
                      "flex justify-between items-start",
                      product.isDeleted && "opacity-75"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "font-medium",
                          product.isDeleted && "line-through text-muted-foreground"
                        )}>
                          {product.name}
                        </p>
                        {product.isEdited && !product.isDeleted && (
                          <span className="inline-flex items-center gap-1 text-xs bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">
                            <Pencil className="h-3 w-3" />
                            Επεξεργάσθηκε
                          </span>
                        )}
                        {product.isDeleted && (
                          <span className="inline-flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                            <X className="h-3 w-3" />
                            Διαγράφηκε
                          </span>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm",
                        product.isDeleted ? "text-muted-foreground" : "text-muted-foreground"
                      )}>
                        {product.quantity}x
                        {product.treatCount > 0 && ` (${product.treatCount}x κέρασμα)`}
                        {product.isEdited && !product.isDeleted && product.originalCode && product.originalQuantity && (
                          <span className="text-xs text-blue-500 ml-2">
                            από: {product.originalCode} ({product.originalQuantity}x)
                          </span>
                        )}
                      </p>
                    </div>
                    <span className={cn(
                      "font-medium tabular-nums",
                      product.isDeleted && "line-through text-muted-foreground"
                    )}>
                      {formatPrice(product.totalAmount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const NotesCard = ({ session, closing }: { session: RegisterSession, closing: RegisterClosing | null }) => {
  const notes = (closing?.notes as any)?.text || (session.notes as any)?.text;
  if (!notes) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2">Σημειώσεις</h3>
        <p className="text-muted-foreground">{notes}</p>
      </CardContent>
    </Card>
  );
};

// Main component
export function ClosingDetails({ session, closing, orders }: ClosingDetailsProps) {
  const productSummary = calculateProductSummary(orders);
  const totals = calculateTransactionTotals(orders);

  return (
    <div className="mt-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TransactionSummaryCard totals={totals} closing={closing} />
        <ProductDetailsCard productSummary={productSummary} />
      </div>
      <NotesCard session={session} closing={closing} />
    </div>
  );
}