"use client";

import { Pencil, X } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { CARD_DISCOUNT } from "@/lib/constants";
import { formatPrice , cn } from "@/lib/utils";
import type { RegisterSession, RegisterClosing, Order, Sale } from "@/types/register";

// Types
interface ClosingDetailsProps {
  session: RegisterSession;
  closing: RegisterClosing | null;
  orders?: Order[];
}

interface ProductSummary {
  id: string;
  name: string;
  originalId: string; // Original product ID
  quantity: number;
  totalAmount: number;
  treatCount: number;
  isEdited: boolean;
  isDeleted: boolean;
  originalCode?: string;
  originalQuantity?: number;
}

interface TransactionTotals {
  totalBeforeDiscounts: number;
  discount: number;
  cardDiscounts: number;
  treats: number;
  treatsAmount: number;
}

// Extend the Sale type from register.ts to include optional is_deleted property
interface ExtendedSale extends Sale {
  is_edited?: boolean;
  is_deleted?: boolean;
  original_code?: string;
  original_quantity?: number;
}

// Utility functions
const calculateProductSummary = (orders?: Order[]): Record<string, ProductSummary> => {
  if (!orders?.length) {return {};}

  const summary = {} as Partial<Record<string, ProductSummary>>;
  const deletedItems = {} as Record<string, ProductSummary>;

  orders.forEach(({ sales = [] }) => {
    sales.forEach((sale) => {
      // Use type assertion to get access to potential is_deleted property
      const extendedSale = sale as ExtendedSale;
      const { code: { id, name }, quantity, total_price, is_treat } = sale;
      
      // Handle deleted sales separately
      if (extendedSale.is_deleted) {
        // Create unique ID for deleted items to avoid collisions
        const deletedId = `deleted-${id}-${extendedSale.id}`;
        
        deletedItems[deletedId] = { 
          id: deletedId,
          name,
          originalId: id,
          quantity,
          totalAmount: total_price,
          treatCount: is_treat ? quantity : 0,
          isEdited: extendedSale.is_edited || false,
          isDeleted: true,
          originalCode: extendedSale.original_code,
          originalQuantity: extendedSale.original_quantity
        };
        return;
      }
      
      // Process active sales as before
      if (!summary[id]) {
        summary[id] = {
          id,
          name,
          originalId: id,
          quantity: 0,
          totalAmount: 0,
          treatCount: 0,
          isEdited: false,
          isDeleted: false,
          originalCode: undefined,
          originalQuantity: undefined
        };
      }
      summary[id].quantity += quantity;
      summary[id].totalAmount += total_price;
      summary[id].treatCount += is_treat ? quantity : 0;
      summary[id].isEdited = extendedSale.is_edited || summary[id].isEdited;
      summary[id].originalCode = extendedSale.original_code || summary[id].originalCode;
      summary[id].originalQuantity = extendedSale.original_quantity || summary[id].originalQuantity;
    });
  });
  
  // Combine active and deleted items, deleted items will appear after active ones
  return { ...(summary as Record<string, ProductSummary>), ...deletedItems };
};

export const calculateTransactionTotals = (orders?: Order[]): TransactionTotals => {
  const defaultTotals: TransactionTotals = {
    totalBeforeDiscounts: 0,
    discount: 0,
    cardDiscounts: 0,
    treats: 0,
    treatsAmount: 0
  };

  if (!orders?.length) {return defaultTotals;}

  return orders.reduce((acc, { sales = [], card_discount_count = 0 }) => {
    sales.forEach(sale => {
      if ((sale as ExtendedSale).is_deleted) {return;}
      
      if (!sale.is_treat) {
        acc.totalBeforeDiscounts += sale.total_price;
      } else {
        acc.treats += sale.quantity;
        acc.treatsAmount += +(sale.unit_price * sale.quantity).toFixed(2);
      }
    });
    
    acc.cardDiscounts += card_discount_count;
    acc.discount = +(acc.cardDiscounts * CARD_DISCOUNT).toFixed(2);
    
    return acc;
  }, defaultTotals);
};

// Component parts
const TransactionSummaryCard = ({ totals }: { totals: TransactionTotals, closing: RegisterClosing | null }) => {
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
  if (!products.length) {return null;}

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
  if (!notes) {return null;}

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