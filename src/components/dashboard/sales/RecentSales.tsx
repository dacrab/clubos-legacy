'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { History } from 'lucide-react';

import type { SaleWithDetails } from '@/types/sales';
import { groupSalesIntoOrders } from '@/lib/utils/salesUtils';
import { useSalesData } from '@/hooks/features/sales/useSalesData';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LoadingAnimation } from '@/components/ui/loading-animation';

import { SaleOrderDetails } from './components/SaleOrderDetails';
import { SaleOrderHeader } from './components/SaleOrderHeader';
import EditableSaleCard from './EditableSaleCard';

// Types
interface RecentSalesProps {
  initialSales?: SaleWithDetails[];
  onDeleteClick: (id: string) => void;
  limit?: number;
}

const EmptyState = memo(() => (
  <div className="flex flex-col items-center justify-center py-6 sm:py-8">
    <History className="text-muted-foreground/30 mb-2 h-10 w-10 sm:mb-3 sm:h-12 sm:w-12" />
    <p className="text-muted-foreground text-xs sm:text-sm">Δεν υπάρχουν πρόσφατες πωλήσεις</p>
  </div>
));
EmptyState.displayName = 'EmptyState';

export default function RecentSales({
  initialSales = [],
  onDeleteClick,
  limit = 5,
}: RecentSalesProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Use our optimized hook with a limit
  const { sales, isLoading } = useSalesData({ limit }, initialSales);

  // Memoize our grouped orders
  const groupedOrders = useMemo(() => groupSalesIntoOrders(sales || []), [sales]);

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
          <p className="text-muted-foreground text-sm">Οι {limit} τελευταίες πωλήσεις.</p>
        </div>
        <Link href="/dashboard/sales" className="text-primary text-sm hover:underline">
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
              <div key={group.id} className="rounded-md border p-3">
                <SaleOrderHeader
                  group={group}
                  isExpanded={expandedGroups.has(group.id)}
                  onToggle={() => toggleGroup(group.id)}
                />
                {expandedGroups.has(group.id) && (
                  <div className="mt-2 space-y-2">
                    {group.items.map(sale => (
                      <EditableSaleCard
                        key={sale.id}
                        sale={sale}
                        onEdit={() => {}}
                        onDelete={() => onDeleteClick(sale.id)}
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
