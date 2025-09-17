'use client';

import { History } from 'lucide-react';
import { useState } from 'react';

import SalesFilter from '@/components/dashboard/sales/sales-filter';
import SalesTable from '@/components/dashboard/sales/sales-table';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import type { SalesDateRange, SalesFilters, TimeRange } from '@/hooks/use-sales-data';
import { useSalesData } from '@/hooks/use-sales-data';

export default function HistoryPage() {
  const [filters, setFilters] = useState<SalesFilters>({});
  const { sales: filteredSales, isLoading } = useSalesData(filters);

  const handleFilterChange = (dateRange: SalesDateRange, timeRange: TimeRange) => {
    setFilters({ dateRange, timeRange });
  };

  if (isLoading) {
    return <LoadingSkeleton className="h-10 w-full" count={4} />;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="mb-2 flex items-center gap-3 sm:gap-4">
        <div className="rounded-full bg-primary/10 p-2 sm:p-3">
          <History className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
        </div>
        <h1 className="font-semibold text-xl sm:text-2xl">Ιστορικό Πωλήσεων</h1>
      </div>

      <div className="space-y-5 sm:space-y-6">
        <SalesFilter onFilterChange={handleFilterChange} />
        <SalesTable initialSales={filteredSales || []} />
      </div>
    </div>
  );
}
