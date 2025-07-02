"use client";

import { useState, useCallback, memo, useMemo } from 'react';
import { History } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { SaleWithDetails } from "@/types/sales";
import EditableSaleCard from "./EditableSaleCard";
import { 
  groupSalesIntoOrders,
} from "@/lib/utils/salesUtils";
import { useSalesData } from "@/hooks/features/sales/useSalesData";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { SaleOrderHeader } from './components/SaleOrderHeader';
import { SaleOrderDetails } from './components/SaleOrderDetails';

// Types
interface RecentSalesProps {
  initialSales?: SaleWithDetails[];
  onDeleteClick: (id: string) => void;
  limit?: number;
}

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
    sales, 
    isLoading 
  } = useSalesData({ limit }, initialSales);
  
  // Memoize our grouped orders
  const groupedOrders = useMemo(() => 
    groupSalesIntoOrders(sales || []),
    [sales]
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
                <SaleOrderHeader
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
                    <SaleOrderDetails group={group} />
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