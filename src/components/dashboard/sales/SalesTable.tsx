"use client";

import { Gift, ChevronDown, CreditCard, Search, History } from "lucide-react";
import { useState, useMemo, useCallback, memo } from "react";

import { Input } from "@/components/ui/input";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSalesData, type SalesFilters } from "@/hooks/useSalesData";
import { cn, formatPrice } from "@/lib/utils";
import { formatDateWithGreekAmPm } from '@/lib/utils/date';
import { 
  type GroupedSale,
  calculateGroupTotals,
} from "@/lib/utils/salesUtils";
import type { Sale } from "@/types/sales";

import EditableSaleCard from "./EditableSaleCard";

interface SalesTableProps {
  initialSales?: Sale[];
  dateRange?: { startDate: string; endDate: string };
  timeRange?: { startTime: string; endTime: string };
}

// Memoized Sale Header Component
const SaleHeader = memo(({ group, isExpanded, onToggle }: { 
  group: GroupedSale;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const { calculatedFinalAmount } = calculateGroupTotals(group);

  return (
    <button 
      onClick={onToggle} 
      className="w-full flex items-start justify-between group/item py-2 px-1 rounded-md hover:bg-muted/50 transition-colors"
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
SaleHeader.displayName = 'SaleHeader';

// Memoized Sale Details Component
const SaleDetails = memo(({ group }: { group: GroupedSale }) => {
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
SaleDetails.displayName = 'SaleDetails';

// Memoized Empty State Component
const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center h-40">
    <History className="h-12 w-12 text-muted-foreground/30 mb-3" />
    <p className="text-sm text-muted-foreground">
      Δεν υπάρχουν πωλήσεις για την επιλεγμένη περίοδο
    </p>
  </div>
));
EmptyState.displayName = 'EmptyState';

// Group sales by order_id
const useGroupedSales = (sales: Sale[] | undefined) => {
  return useMemo(() => {
    if (!sales?.length) {return [];}
    
    const groups = sales.reduce((map, sale) => {
      if (!sale.order) {
        console.warn(`Sale ${sale.id} has no order property. Skipping this sale.`);
        return map;
      }

      const group = map.get(sale.order_id) || {
        id: sale.order_id,
        created_at: sale.created_at,
        total: 0,
        items: [],
        treats_count: 0,
        final_amount: sale.order.final_amount || 0,
        card_discount_count: sale.order.card_discount_count || 0
      };

      group.items.push(sale);
      
      // Only add non-treats and non-deleted items to total
      if (!sale.is_treat && !sale.is_deleted) {
        group.total += sale.total_price;
      }
      
      // Count the number of non-deleted treat items
      if (sale.is_treat && !sale.is_deleted) {
        group.treats_count += sale.quantity;
      }

      map.set(sale.order_id, group);
      return map;
    }, new Map<string, GroupedSale>());

    return Array.from(groups.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [sales]);
};

export default function SalesTable({ 
  initialSales = [], 
  dateRange, 
  timeRange 
}: SalesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Create filters for the hook
  const filters = useMemo<SalesFilters>(() => ({
    dateRange,
    timeRange,
    searchQuery
  }), [dateRange, timeRange, searchQuery]);
  
  // Use our custom hook
  const { sales, isLoading } = useSalesData(filters);
  
  // Use initial data if provided and not loading our own
  const displaySales = useMemo(() => 
    (isLoading && initialSales.length > 0) ? initialSales : sales,
  [sales, initialSales, isLoading]);
  
  // Group the sales for display
  const groupedSales = useGroupedSales(displaySales);
  
  // Calculate total amount
  const totalAmount = useMemo(() => 
    groupedSales.reduce((sum, group) => {
      const { calculatedFinalAmount } = calculateGroupTotals(group);
      return sum + calculatedFinalAmount;
    }, 0),
    [groupedSales]
  );

  // Toggle group expansion
  const toggleGroup = useCallback((id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Handle search with debounce
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const debounceTimeout = setTimeout(() => setSearchQuery(value), 300);
    return () => clearTimeout(debounceTimeout);
  }, []);

  // Placeholder for delete functionality
  const handleDeleteClick = useCallback((_id: string) => {
    // This is a placeholder, actual implementation would be in a parent component
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Search and Total Bar */}
      <div className="flex flex-row items-center justify-between gap-4 sm:gap-5 border rounded-lg p-4 sm:p-5 bg-background">
        <div className="relative w-full xs:w-[180px] sm:w-[220px]">
          <Search className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          <Input
            placeholder="Αναζήτηση..."
            onChange={handleSearchChange}
            className="pl-10 sm:pl-11 h-9 sm:h-10 text-xs sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 bg-muted rounded-lg">
          <span className="text-xs sm:text-sm text-muted-foreground">Σύνολο:</span>
          <span className="text-xs sm:text-sm font-medium">{formatPrice(totalAmount)}</span>
        </div>
      </div>

      {/* Sales List */}
      <div className="border rounded-lg overflow-hidden bg-background">
        {isLoading && !initialSales.length ? (
          <div className="p-4 flex justify-center">
            <LoadingAnimation />
          </div>
        ) : groupedSales.length > 0 ? (
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
              {groupedSales.map((group) => {
                const isExpanded = expandedGroups.has(group.id);
                return (
                  <div key={group.id} className="border rounded-lg p-3 sm:p-4 hover:bg-accent/5 transition-colors">
                    <SaleHeader
                      group={group}
                      isExpanded={isExpanded}
                      onToggle={() => toggleGroup(group.id)}
                    />
                    {isExpanded && (
                      <div className="space-y-3 mt-3">
                        {group.items.map(sale => (
                          <EditableSaleCard
                            key={sale.id}
                            sale={sale}
                            onDeleteClick={handleDeleteClick}
                          />
                        ))}
                        <SaleDetails group={group} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-4 sm:p-6">
            <EmptyState />
          </div>
        )}
      </div>
    </div>
  );
}