"use client";

import { memo, useState, useEffect } from "react";
import { Gift, ChevronDown, ChevronUp, CreditCard } from "lucide-react";
import { cn, formatPrice, formatDateWithGreekAmPm } from "@/lib/utils";
import type { GroupedSale } from "@/types/sales";
import { calculateGroupTotals } from "@/lib/utils/salesUtils";
import { Badge } from "@/components/ui/badge";

interface SaleOrderHeaderProps {
  group: GroupedSale;
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
}

const SaleOrderHeader = memo(({ group, isExpanded, onToggle, className }: SaleOrderHeaderProps) => {
  const { calculatedFinalAmount } = calculateGroupTotals(group);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full flex items-start justify-between group/item py-2 px-1 rounded-md">
        <div className="space-y-1.5 animate-pulse">
          <div className="h-4 bg-muted rounded w-24"></div>
          <div className="h-5 bg-muted rounded w-16"></div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 animate-pulse">
          <div className="h-5 bg-muted rounded w-12"></div>
          <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={onToggle} 
      className={cn("w-full flex items-start justify-between group/item py-2 px-1 rounded-md hover:bg-muted/50 transition-colors", className)}
    >
      <div className="space-y-1.5">
        <p className="text-xs sm:text-sm text-muted-foreground">
          {formatDateWithGreekAmPm(new Date(group.created_at))}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {group.treats_count > 0 && (
            <span className="inline-flex items-center gap-1 text-xs sm:text-sm bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full">
              <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {group.treats_count}x
            </span>
          )}
          {group.card_discount_count > 0 && (
            <span className="inline-flex items-center gap-1 text-xs sm:text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
              <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {group.card_discount_count}x
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xs sm:text-sm font-medium tabular-nums">
          {formatPrice(calculatedFinalAmount)}
        </span>
        <ChevronDown className={cn("h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
      </div>
    </button>
  );
});
SaleOrderHeader.displayName = 'SaleOrderHeader';

export { SaleOrderHeader }; 