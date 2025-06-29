"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { Search, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatPrice } from "@/lib/utils";
import { SaleWithDetails } from "@/types/sales";
import { 
  GroupedSale,
  calculateGroupTotals,
  groupSalesIntoOrders,
} from "@/lib/utils/salesUtils";
import { useSalesData, SalesFilters } from "@/hooks/features/sales/useSalesData";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import EditableSaleCard from "./EditableSaleCard";
import { SaleOrderHeader } from "./components/SaleOrderHeader";
import { SaleOrderDetails } from "./components/SaleOrderDetails";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface SalesTableProps {
  initialSales?: SaleWithDetails[];
  dateRange?: { startDate: string; endDate: string };
  timeRange?: { startTime: string; endTime: string };
}

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
  const groupedSales = useMemo(() => groupSalesIntoOrders(displaySales || []), [displaySales]);
  
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
  const handleDeleteClick = useCallback((id: string) => {
    console.log(`Delete request for sale ${id} - not implemented in SalesTable`);
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
                    <SaleOrderHeader
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
                        <SaleOrderDetails group={group} />
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