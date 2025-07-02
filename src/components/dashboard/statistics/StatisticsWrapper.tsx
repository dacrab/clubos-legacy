"use client";

import StatsCards from "./StatsCards";
import SalesChart from "./SalesChart";
import TopProductsChart from "./TopProductsChart";
import CategorySalesChart from "./CategorySalesChart";
import RevenueChart from "./RevenueChart";
import StatisticsFilter from "./StatisticsFilter";
import { ChartPie } from "lucide-react";
import { useStatisticsData } from "@/hooks/features/statistics/useStatisticsData";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import type { SaleWithDetails } from '@/types/sales';

interface StatisticsWrapperProps {
  initialSales: SaleWithDetails[];
}

export default function StatisticsWrapper({ initialSales }: StatisticsWrapperProps) {
  const {
    setDateRange,
    filteredSales,
    categories,
    subCategories,
    loading
  } = useStatisticsData(initialSales);

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <ChartPie className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Στατιστικά</h1>
            <p className="text-muted-foreground">
              Προβολή στατιστικών και αναλύσεων
            </p>
          </div>
        </div>
        <StatisticsFilter onFilterChange={setDateRange} />
      </div>

      {/* Charts Grid */}
      <div className="flex-1 grid gap-6">
        {/* Stats Overview */}
        <StatsCards sales={filteredSales} />

        {/* Daily Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SalesChart sales={filteredSales} />
          <RevenueChart sales={filteredSales} />
          <CategorySalesChart 
            sales={filteredSales} 
            categories={categories}
            subCategories={subCategories}
          />
          <TopProductsChart sales={filteredSales} />
        </div>
      </div>
    </div>
  );
} 