'use client';

import { ChevronDown, CreditCard, Gift, History } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';

import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchInput } from '@/components/ui/search-input';
import { type SalesFilters, useSalesData } from '@/hooks/use-sales-data';
import { useSearch } from '@/hooks/utils/use-search';
import type { GroupedSale, SaleLike } from '@/lib/utils/chart-utils';
import { formatDateWithGreekAmPm } from '@/lib/utils/date';
import { cn, formatPrice } from '@/lib/utils/format';
import { computeGroupedSaleTotals } from '@/lib/utils/sales-totals';
import type { SaleLike as Sale } from '@/types/sales';

// Constants
const DEBOUNCE_TIMEOUT = 300;
const SCROLL_HEIGHT = 'calc(100vh-16rem)';

// Types
type SalesTableProps = {
  initialSales?: (Sale | SaleLike)[];
  dateRange?: { startDate: string; endDate: string };
  timeRange?: { startTime: string; endTime: string };
};

type SaleHeaderProps = {
  group: GroupedSale;
  isExpanded: boolean;
  onToggle: () => void;
};

type SaleDetailsProps = {
  group: GroupedSale;
};

// Utility Functions
const calculateGroupTotals = (group: GroupedSale) => {
  const { grossSubtotal, treatsValue, discountAmount, finalAmount } =
    computeGroupedSaleTotals(group);
  return {
    grossSubtotal,
    treatsValue,
    discountAmount,
    calculatedFinalAmount: finalAmount,
  };
};

// Custom Hooks
const useGroupedSales = (sales: (Sale | SaleLike)[] | undefined) => {
  return useMemo(() => {
    if (!sales?.length) {
      return [];
    }

    const groups = sales.reduce((map, sale) => {
      // Skip sales without order relation
      if (!(sale as SaleLike).order) {
        return map;
      }

      const group = map.get(sale.order_id) || {
        id: sale.order_id,
        created_at: sale.created_at,
        total: 0,
        items: [] as SaleLike[],
        treats_count: 0,
        final_amount: 0,
        card_discount_count: (sale as SaleLike).order?.card_discounts_applied || 0,
        is_card_payment: (sale as { payment_method: string }).payment_method === 'card',
      };

      group.items.push(sale as SaleLike);

      // Only add non-treats and non-deleted items to total
      if (!((sale as SaleLike).is_treat || (sale as { is_deleted?: boolean }).is_deleted)) {
        group.total += sale.total_price;
      }

      // Count the number of non-deleted treat items
      if ((sale as SaleLike).is_treat && !(sale as { is_deleted?: boolean }).is_deleted) {
        group.treats_count += (sale as SaleLike).quantity;
      }

      map.set(sale.order_id, group);
      return map;
    }, new Map<string, GroupedSale>());

    const groupedArray = Array.from(groups.values()) as GroupedSale[];
    return groupedArray.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [sales]);
};

// Components
const SaleHeader = memo(({ group, isExpanded, onToggle }: SaleHeaderProps) => {
  const { calculatedFinalAmount } = calculateGroupTotals(group);

  const handleClick = () => {
    onToggle();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      aria-expanded={isExpanded}
      aria-label={`Επέκταση πώλησης ${formatDateWithGreekAmPm(new Date(group.created_at))}`}
      className="group/item flex w-full items-start justify-between rounded-md px-1 py-2 transition-colors hover:bg-muted/50"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      type="button"
    >
      <div className="space-y-1.5">
        <p className="text-muted-foreground text-xs sm:text-sm">
          {formatDateWithGreekAmPm(new Date(group.created_at))}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {group.treats_count > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-amber-500 text-xs sm:text-sm">
              <Gift className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {group.treats_count}x
            </span>
          )}
          {group.card_discount_count > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary text-xs sm:text-sm">
              <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {group.card_discount_count}x
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="font-medium text-xs tabular-nums sm:text-sm">
          {formatPrice(calculatedFinalAmount)}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform sm:h-5 sm:w-5',
            isExpanded && 'rotate-180'
          )}
        />
      </div>
    </button>
  );
});
SaleHeader.displayName = 'SaleHeader';

const SaleDetails = memo(({ group }: SaleDetailsProps) => {
  const { grossSubtotal, treatsValue, discountAmount, calculatedFinalAmount } =
    calculateGroupTotals(group);

  return (
    <div className="mt-3 space-y-2 border-t pt-3 sm:mt-4 sm:space-y-3 sm:pt-4">
      <div className="flex justify-between text-muted-foreground text-xs sm:text-sm">
        <span>Υποσύνολο:</span>
        <span>{formatPrice(grossSubtotal)}</span>
      </div>
      {group.treats_count > 0 && (
        <div className="flex justify-between text-amber-500 text-xs sm:text-sm">
          <span>Κεράσματα ({group.treats_count}x):</span>
          <span>Δωρεάν ({formatPrice(treatsValue)})</span>
        </div>
      )}
      {group.card_discount_count > 0 && (
        <div className="flex justify-between text-primary text-xs sm:text-sm">
          <span>Έκπτωση κάρτας ({group.card_discount_count}x):</span>
          <span>-{formatPrice(discountAmount)}</span>
        </div>
      )}
      <div className="flex justify-between pt-1.5 font-medium text-xs sm:text-sm">
        <span>Σύνολο:</span>
        <span>{formatPrice(calculatedFinalAmount)}</span>
      </div>
    </div>
  );
});
SaleDetails.displayName = 'SaleDetails';

const EmptyState = memo(() => (
  <div className="flex h-40 flex-col items-center justify-center">
    <History className="mb-3 h-12 w-12 text-muted-foreground/30" />
    <p className="text-muted-foreground text-sm">
      Δεν υπάρχουν πωλήσεις για την επιλεγμένη περίοδο
    </p>
  </div>
));
EmptyState.displayName = 'EmptyState';

const SaleItem = memo(({ sale }: { sale: SaleLike }) => (
  <div className="flex items-center justify-between rounded border p-2">
    <div className="flex items-center gap-2">
      <span className="font-medium text-sm">{sale.code?.name || sale.code_id}</span>
      {sale.is_treat && (
        <span className="rounded bg-amber-500/10 px-2 py-0.5 text-amber-600 text-xs">Κέρασμα</span>
      )}
    </div>
    <div className="text-sm">
      {sale.quantity}x · {formatPrice(sale.total_price)}
    </div>
  </div>
));
SaleItem.displayName = 'SaleItem';

const SearchAndTotalBar = memo(
  ({
    debouncedQuery,
    handleSearchChange,
    clearSearch,
    totalAmount,
  }: {
    debouncedQuery: string;
    handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    clearSearch: () => void;
    totalAmount: number;
  }) => (
    <div className="flex flex-row items-center justify-between gap-4 rounded-lg border bg-background p-4 sm:gap-5 sm:p-5">
      <div className="w-full xs:w-[180px] sm:w-[220px]">
        <SearchInput
          className="h-9 text-xs sm:h-10 sm:text-sm"
          onChange={handleSearchChange}
          onClear={clearSearch}
          placeholder="Αναζήτηση..."
          value={debouncedQuery}
        />
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 sm:gap-3 sm:px-5 sm:py-2.5">
        <span className="text-muted-foreground text-xs sm:text-sm">Σύνολο:</span>
        <span className="font-medium text-xs sm:text-sm">{formatPrice(totalAmount)}</span>
      </div>
    </div>
  )
);
SearchAndTotalBar.displayName = 'SearchAndTotalBar';

const SalesListContent = memo(
  ({
    isLoading,
    initialSales,
    groupedSales,
    expandedGroups,
    toggleGroup,
  }: {
    isLoading: boolean;
    initialSales: (Sale | SaleLike)[];
    groupedSales: GroupedSale[];
    expandedGroups: Set<string>;
    toggleGroup: (id: string) => void;
  }) => {
    if (isLoading && !initialSales.length) {
      return (
        <div className="p-4">
          <LoadingSkeleton className="h-10 w-full rounded-md" count={3} />
        </div>
      );
    }

    if (groupedSales.length > 0) {
      return (
        <ScrollArea className={`h-[${SCROLL_HEIGHT}]`}>
          <div className="space-y-3 p-4 sm:space-y-4 sm:p-5">
            {groupedSales.map((group) => {
              const isExpanded = expandedGroups.has(group.id);
              return (
                <div
                  className="rounded-lg border p-3 transition-colors hover:bg-accent/5 sm:p-4"
                  key={group.id}
                >
                  <SaleHeader
                    group={group}
                    isExpanded={isExpanded}
                    onToggle={() => toggleGroup(group.id)}
                  />
                  {isExpanded && (
                    <div className="mt-3 space-y-3">
                      {group.items.map((sale) => (
                        <SaleItem key={sale.id} sale={sale} />
                      ))}
                      <SaleDetails group={group} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      );
    }

    return (
      <div className="p-4 sm:p-6">
        <EmptyState />
      </div>
    );
  }
);
SalesListContent.displayName = 'SalesListContent';

// Main Component
export default function SalesTable({ initialSales = [], dateRange, timeRange }: SalesTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const { debouncedQuery, handleSearchChange, clearSearch } = useSearch({
    debounceMs: DEBOUNCE_TIMEOUT,
  });

  // Create filters for the hook
  const filters = useMemo<SalesFilters>(
    () => ({
      ...(dateRange ? { dateRange } : {}),
      ...(timeRange ? { timeRange } : {}),
      ...(debouncedQuery ? { searchQuery: debouncedQuery } : {}),
    }),
    [dateRange, timeRange, debouncedQuery]
  );

  // Use our custom hook
  const { sales, isLoading } = useSalesData(filters);

  // Use initial data if provided and not loading our own
  const displaySales = useMemo(
    () => (isLoading && initialSales.length > 0 ? initialSales : sales),
    [sales, initialSales, isLoading]
  );

  // Group the sales for display
  const groupedSales = useGroupedSales(displaySales);

  // Calculate total amount
  const totalAmount = useMemo(
    () =>
      groupedSales.reduce((sum, group) => {
        const { calculatedFinalAmount } = calculateGroupTotals(group);
        return sum + calculatedFinalAmount;
      }, 0),
    [groupedSales]
  );

  // Toggle group expansion
  const toggleGroup = useCallback((id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  return (
    <div className="space-y-4 sm:space-y-5">
      <SearchAndTotalBar
        clearSearch={clearSearch}
        debouncedQuery={debouncedQuery}
        handleSearchChange={handleSearchChange}
        totalAmount={totalAmount}
      />

      <div className="overflow-hidden rounded-lg border bg-background">
        <SalesListContent
          expandedGroups={expandedGroups}
          groupedSales={groupedSales}
          initialSales={initialSales}
          isLoading={isLoading}
          toggleGroup={toggleGroup}
        />
      </div>
    </div>
  );
}
