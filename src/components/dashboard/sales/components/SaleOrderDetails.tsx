"use client";

import { memo } from "react";
import { formatPrice } from "@/lib/utils";
import { calculateGroupTotals, getActiveItemsCount } from "@/lib/utils/salesUtils";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { GroupedSale } from "@/types/sales";

interface SaleOrderDetailsProps {
  group: GroupedSale;
}

const SaleOrderDetails = memo(({ group }: { group: GroupedSale }) => {
  const { nonTreatSubtotal, treatsValue, discountAmount, calculatedFinalAmount } = calculateGroupTotals(group);
  
  return (
    <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t space-y-2 sm:space-y-3">
      <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
        <span>Υποσύνολο:</span>
        <span>{formatPrice(nonTreatSubtotal)}</span>
      </div>
      {group.treats_count > 0 && (
        <div className="flex justify-between text-xs sm:text-sm text-amber-500">
          <span>Κεράσματα ({group.treats_count}x):</span>
          <span>Δωρεάν ({formatPrice(treatsValue)})</span>
        </div>
      )}
      {group.card_discount_count > 0 && (
        <div className="flex justify-between text-xs sm:text-sm text-primary">
          <span>Έκπτωση κάρτας ({group.card_discount_count}x):</span>
          <span>-{formatPrice(discountAmount)}</span>
        </div>
      )}
      <div className="flex justify-between text-xs sm:text-sm font-medium pt-1.5">
        <span>Σύνολο:</span>
        <span>{formatPrice(calculatedFinalAmount)}</span>
      </div>
    </div>
  );
});
SaleOrderDetails.displayName = 'SaleOrderDetails';

export { SaleOrderDetails }; 