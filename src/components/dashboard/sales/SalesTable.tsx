'use client';

import { useMemo, useState } from 'react';
import { History, Search } from 'lucide-react';

import type { SaleWithDetails } from '@/types/sales';
import { formatPrice } from '@/lib/utils';
import { useSalesData } from '@/hooks/features/sales/useSalesData';
import { Input } from '@/components/ui/input';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SalesTableProps {
  initialSales?: SaleWithDetails[];
  dateRange?: { startDate: string; endDate: string };
  timeRange?: { startTime: string; endTime: string };
}

export default function SalesTable({ initialSales = [], dateRange, timeRange }: SalesTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const filters = useMemo(
    () => ({
      dateRange,
      timeRange,
      searchQuery,
    }),
    [dateRange, timeRange, searchQuery]
  );

  const { sales, isLoading } = useSalesData(filters, initialSales);

  const totalAmount = useMemo(
    () => sales?.reduce((sum, sale) => sum + parseFloat(sale.totalPrice || '0'), 0) || 0,
    [sales]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <LoadingAnimation />
      </div>
    );
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center">
        <History className="text-muted-foreground/30 mb-3 h-12 w-12" />
        <p className="text-muted-foreground text-sm">
          Δεν υπάρχουν πωλήσεις για την επιλεγμένη περίοδο
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {/* Search and Total */}
      <div className="bg-background flex items-center justify-between gap-4 rounded-lg border p-4">
        <div className="relative w-64">
          <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
          <Input
            placeholder="Αναζήτηση..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <div className="bg-muted flex items-center gap-2 rounded-lg px-4 py-2">
          <span className="text-muted-foreground text-sm">Σύνολο:</span>
          <span className="text-sm font-medium">{formatPrice(totalAmount)}</span>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-background rounded-lg border">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="space-y-3 p-4">
            {sales.map(sale => (
              <div
                key={sale.id}
                className="hover:bg-accent/5 rounded-lg border p-4 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{sale.product?.name || 'Unknown Product'}</h3>
                    <p className="text-muted-foreground text-sm">
                      Ποσότητα: {sale.quantity} × {formatPrice(parseFloat(sale.unitPrice || '0'))}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(sale.createdAt).toLocaleString('el-GR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(parseFloat(sale.totalPrice || '0'))}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
