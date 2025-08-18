'use client';

import { useMemo, useState } from 'react';

import type { SaleWithDetails } from '@/types/sales';

import RevenueChart from './RevenueChart';
import SalesChart from './SalesChart';
import StatisticsFilter from './StatisticsFilter';
import StatsCards from './StatsCards';
import TopProductsChart from './TopProductsChart';

interface StatisticsWrapperProps {
  initialSales: SaleWithDetails[];
}

export default function StatisticsWrapper({ initialSales }: StatisticsWrapperProps) {
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString(),
    categoryId: '',
    subcategoryId: '',
    productId: '',
  });

  // Filter sales based on date range and other filters
  const filteredSales = useMemo(() => {
    return initialSales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);

      // Check date range
      if (saleDate < startDate || saleDate > endDate) {
        return false;
      }

      // Check category filter
      if (filters.categoryId && sale.product?.categoryId !== filters.categoryId) {
        return false;
      }

      // Check product filter
      if (filters.productId && sale.productId !== filters.productId) {
        return false;
      }

      return true;
    });
  }, [initialSales, filters]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="space-y-6">
      <StatisticsFilter onFilterChange={handleFilterChange} />

      {filteredSales.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">
          Δεν υπάρχουν δεδομένα πωλήσεων για την επιλεγμένη περίοδο
        </div>
      ) : (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <StatsCards sales={filteredSales} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <SalesChart sales={filteredSales} />
            <RevenueChart sales={filteredSales} />
          </div>

          {/* Top Products Chart */}
          <TopProductsChart sales={filteredSales} />

          {/* Summary Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
              <div>
                <p className="text-primary text-2xl font-bold">{filteredSales.length}</p>
                <p className="text-muted-foreground text-sm">Συνολικές Πωλήσεις</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {filteredSales.reduce((sum, sale) => sum + sale.quantity, 0)}
                </p>
                <p className="text-muted-foreground text-sm">Συνολικά Τεμάχια</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  €
                  {filteredSales
                    .reduce((sum, sale) => sum + parseFloat(sale.totalPrice?.toString() || '0'), 0)
                    .toFixed(2)}
                </p>
                <p className="text-muted-foreground text-sm">Συνολικά Έσοδα</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {filteredSales.filter(sale => sale.isTreat).length}
                </p>
                <p className="text-muted-foreground text-sm">Κεράσματα</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
