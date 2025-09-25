'use client';

import { History } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/dashboard/common/page-header';
import SalesFilter from '@/components/dashboard/sales/sales-filter';
import SalesTable from '@/components/dashboard/sales/sales-table';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useAuth } from '@/hooks/use-auth';
import type { SalesDateRange, SalesFilters, TimeRange } from '@/hooks/use-sales-data';
import { useSalesData } from '@/hooks/use-sales-data';

export default function HistoryPage() {
  const { loading: authLoading } = useAuth({
    redirectOnUnauthorized: true,
  });

  const [filters, setFilters] = useState<SalesFilters>({});
  const { sales: filteredSales, isLoading: dataLoading } = useSalesData(filters);

  const handleFilterChange = (dateRange: SalesDateRange, timeRange: TimeRange) => {
    setFilters({ dateRange, timeRange });
  };

  const isLoading = authLoading || dataLoading;

  if (isLoading) {
    return <LoadingSkeleton className="h-10 w-full" count={4} />;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        description="Προβολή και φιλτράρισμα του ιστορικού πωλήσεων"
        icon={History}
        title="Ιστορικό Πωλήσεων"
      />

      <div className="space-y-5 sm:space-y-6">
        <SalesFilter onFilterChange={handleFilterChange} />
        <SalesTable initialSales={filteredSales || []} />
      </div>
    </div>
  );
}
