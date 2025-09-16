'use client';

import { ChartPie } from 'lucide-react';
import { useMemo, useState } from 'react';

import { filterSalesByDateRange, type SaleLike } from '@/lib/utils/chart-utils';

import CategorySalesChart from './category-sales-chart';
import RevenueChart from './revenue-chart';
import SalesChart from './sales-chart';
import StatisticsFilter from './statistics-filter';
import StatsCards from './stats-cards';

type StatisticsWrapperProps = {
  initialSales: SaleLike[];
};

export default function StatisticsWrapper({ initialSales }: StatisticsWrapperProps) {
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  } | null>(null);

  const filteredSales = useMemo((): SaleLike[] => {
    return filterSalesByDateRange(initialSales, dateRange);
  }, [initialSales, dateRange]);

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <ChartPie className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-tight">Στατιστικά</h1>
            <p className="text-muted-foreground">Προβολή στατιστικών και αναλύσεων</p>
          </div>
        </div>
        <StatisticsFilter
          onFilterChange={(range) => {
            setDateRange(range);
          }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid flex-1 gap-6">
        {/* Stats Overview */}
        <StatsCards sales={filteredSales} />

        {/* Daily Charts */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SalesChart sales={filteredSales} />
          <RevenueChart sales={filteredSales} />
        </div>

        {/* Analysis Charts */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CategorySalesChart sales={filteredSales} />
        </div>
      </div>
    </div>
  );
}
