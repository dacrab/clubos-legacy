import { memo } from 'react';

import type { GroupedSale } from '@/types/sales';
import { formatPrice } from '@/lib/utils';
import { calculateGroupTotals } from '@/lib/utils/salesUtils';

// removed unused _SaleOrderDetailsProps

const SaleOrderDetails = memo(({ group }: { group: GroupedSale }) => {
  const { nonTreatSubtotal, treatsValue, discountAmount, calculatedFinalAmount } =
    calculateGroupTotals(group);

  return (
    <div className="mt-3 space-y-2 border-t pt-3 sm:mt-4 sm:space-y-3 sm:pt-4">
      <div className="text-muted-foreground flex justify-between text-xs sm:text-sm">
        <span>Υποσύνολο:</span>
        <span>{formatPrice(nonTreatSubtotal)}</span>
      </div>
      {group.treats_count > 0 && (
        <div className="flex justify-between text-xs text-amber-500 sm:text-sm">
          <span>Κεράσματα ({group.treats_count}x):</span>
          <span>Δωρεάν ({formatPrice(treatsValue)})</span>
        </div>
      )}
      {group.card_discount_count > 0 && (
        <div className="text-primary flex justify-between text-xs sm:text-sm">
          <span>Έκπτωση κάρτας ({group.card_discount_count}x):</span>
          <span>-{formatPrice(discountAmount)}</span>
        </div>
      )}
      <div className="flex justify-between pt-1.5 text-xs font-medium sm:text-sm">
        <span>Σύνολο:</span>
        <span>{formatPrice(calculatedFinalAmount)}</span>
      </div>
    </div>
  );
});
SaleOrderDetails.displayName = 'SaleOrderDetails';

export { SaleOrderDetails };
