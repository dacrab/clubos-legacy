"use client";

import { History, ChevronDown, CreditCard, Gift } from "lucide-react";
import Link from "next/link";
import { useState, useCallback, memo, useMemo } from 'react';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { useSalesData } from "@/hooks/useSalesData";
import { cn, formatPrice } from "@/lib/utils";
import { formatDateWithGreekAmPm } from '@/lib/utils/date';
import { 
  type GroupedSale, 
  calculateGroupTotals,
  groupSalesIntoOrders,
} from "@/lib/utils/salesUtils";
import type { Sale } from "@/types/sales";

import EditableSaleCard from "./EditableSaleCard";

// Types
interface RecentSalesProps {
  initialSales?: Sale[];
  onDeleteClick: (id: string) => void;
  limit?: number;
}

// Memoized Components
const SaleHeader = memo(({ group, isExpanded, onToggle }: { 
  group: GroupedSale;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const { calculatedFinalAmount } = calculateGroupTotals(group);

  return (
    <button onClick={onToggle} className="w-full flex items-start justify-between group/item">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          {formatDateWithGreekAmPm(new Date(group.created_at))}
        </p>
        <div className="flex items-center gap-2">
          {group.treats_count > 0 && (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
              <Gift className="h-3 w-3" />
              {group.treats_count}x
            </span>
          )}
          {group.card_discount_count > 0 && (
            <span className="inline-flex items-center gap-1 text-xs bg-violet-500/10 text-violet-500 px-2 py-0.5 rounded-full">
              <CreditCard className="h-3 w-3" />
              {group.card_discount_count}x
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-medium tabular-nums">
          {formatPrice(calculatedFinalAmount)}
        </span>
        <div className={cn(
          "transition-transform duration-200",
          isExpanded ? "rotate-180" : ""
        )}>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </button>
  );
});
SaleHeader.displayName = 'SaleHeader';

const SaleDetails = memo(({ group }: { group: GroupedSale }) => {
  const { nonTreatSubtotal, treatsValue, discountAmount, calculatedFinalAmount } = calculateGroupTotals(group);
  
  return (
    <div className="pt-3 mt-3 border-t space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Υποσύνολο:</span>
        <span>{formatPrice(nonTreatSubtotal)}</span>
      </div>
      {group.treats_count > 0 && (
        <div className="flex justify-between text-sm text-amber-500">
          <span>Κεράσματα ({group.treats_count}x):</span>
          <span>Δωρεάν ({formatPrice(treatsValue)})</span>
        </div>
      )}
      {group.card_discount_count > 0 && (
        <div className="flex justify-between text-sm text-primary">
          <span>Έκπτωση κάρτας ({group.card_discount_count}x):</span>
          <span>-{formatPrice(discountAmount)}</span>
        </div>
      )}
      <div className="flex justify-between text-base font-medium pt-1">
        <span>Σύνολο:</span>
        <span>{formatPrice(calculatedFinalAmount)}</span>
      </div>
    </div>
  );
});
SaleDetails.displayName = 'SaleDetails';

const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center py-6 sm:py-8">
    <History className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/30 mb-2 sm:mb-3" />
    <p className="text-xs sm:text-sm text-muted-foreground">
      Δεν υπάρχουν πρόσφατες πωλήσεις
    </p>
  </div>
));
EmptyState.displayName = 'EmptyState';

export default function RecentSales({ initialSales = [], onDeleteClick, limit = 5 }: RecentSalesProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  // Use our optimized hook with a limit
  const { 
    sales: _sales, 
    isLoading 
  } = useSalesData({ limit });
  
  // Use initial data if provided and we're still loading
  const displaySales = useMemo(() => {
    if (isLoading && initialSales.length > 0) {return initialSales;}
    return _sales;
  }, [_sales, initialSales, isLoading]);
  
  // Memoize our grouped orders
  const groupedOrders = useMemo(() => 
    groupSalesIntoOrders(displaySales || []),
    [displaySales]
  );
  
  // Memoize toggle function
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Πρόσφατες Πωλήσεις</h2>
          <p className="text-sm text-muted-foreground">
            Τα τελευταία {limit} προϊόντα που πουλήθηκαν
          </p>
        </div>
        <Link
          href="/dashboard/sales"
          className="text-sm text-primary hover:underline"
        >
          Περισσότερα
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading && !initialSales.length ? (
          <div className="flex justify-center py-4">
            <LoadingAnimation className="h-8 w-8" />
          </div>
        ) : groupedOrders.length > 0 ? (
          <div className="space-y-4">
            {groupedOrders.map(group => (
              <div key={group.id} className="border rounded-md p-3">
                <SaleHeader
                  group={group}
                  isExpanded={expandedGroups.has(group.id)}
                  onToggle={() => toggleGroup(group.id)}
                />
                {expandedGroups.has(group.id) && (
                  <div className="space-y-2 mt-2">
                    {group.items.map(sale => (
                      <EditableSaleCard
                        key={sale.id}
                        sale={sale}
                        onDeleteClick={() => onDeleteClick(sale.id)}
                      />
                    ))}
                    <SaleDetails group={group} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  );
}