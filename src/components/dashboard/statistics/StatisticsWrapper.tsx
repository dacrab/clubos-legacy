"use client";

import { ChartPie } from "lucide-react";
import { useState, useMemo } from 'react';

import { filterSalesByDateRange } from "@/lib/utils/chart-utils";
import type { Sale } from '@/types/sales';

import CategorySalesChart from "./CategorySalesChart";
import RevenueChart from "./RevenueChart";
import SalesChart from "./SalesChart";
import StatisticsFilter from "./StatisticsFilter";
import StatsCards from "./StatsCards";
import TopCodesChart from "./TopCodesChart";

interface StatisticsWrapperProps {
  initialSales: Sale[];
}

export default function StatisticsWrapper({ initialSales }: StatisticsWrapperProps) {
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string } | null>(null);

  const filteredSales = useMemo(() => {
    return filterSalesByDateRange(initialSales, dateRange);
  }, [initialSales, dateRange]);

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
        <StatisticsFilter 
          onFilterChange={(range) => {
            setDateRange(range);
          }} 
        />
      </div>

      {/* Charts Grid */}
      <div className="flex-1 grid gap-6">
        {/* Stats Overview */}
        <StatsCards sales={filteredSales} />

        {/* Daily Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SalesChart sales={filteredSales} />
          <RevenueChart sales={filteredSales} />
        </div>

        {/* Analysis Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TopCodesChart sales={filteredSales} />
          <CategorySalesChart sales={filteredSales} />
        </div>
      </div>
    </div>
  );
} 