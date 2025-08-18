'use client';

import { memo } from 'react';
import { ChevronDown, CreditCard, Gift } from 'lucide-react';

import type { GroupedSale } from '@/types/sales';
import { cn, formatDateWithGreekAmPm, formatPrice } from '@/lib/utils';
import { calculateGroupTotals } from '@/lib/utils/salesUtils';

interface SaleOrderHeaderProps {
  group: GroupedSale;
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

const SaleOrderHeader = memo(({ group, isExpanded, onToggle, className }: SaleOrderHeaderProps) => {
  const { calculatedFinalAmount } = calculateGroupTotals(group);

  return (
    <button
      onClick={onToggle}
      className={cn(
        'group/item hover:bg-muted/50 flex w-full items-start justify-between rounded-md px-1 py-2 transition-colors',
        className
      )}
    >
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs sm:text-sm">
          {formatDateWithGreekAmPm(new Date(group.created_at))}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {group.treats_count > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs text-amber-500 sm:text-sm">
              <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {group.treats_count}x
            </span>
          )}
          {group.card_discount_count > 0 && (
            <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs sm:text-sm">
              <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {group.card_discount_count}x
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xs font-medium tabular-nums sm:text-sm">
          {formatPrice(calculatedFinalAmount)}
        </span>
        <ChevronDown
          className={cn(
            'text-muted-foreground h-4 w-4 transition-transform sm:h-5 sm:w-5',
            isExpanded && 'rotate-180'
          )}
        />
      </div>
    </button>
  );
});
SaleOrderHeader.displayName = 'SaleOrderHeader';

export { SaleOrderHeader };
