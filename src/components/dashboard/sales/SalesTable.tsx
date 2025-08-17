"use client";

import { Search, History } from "lucide-react";
import { useState, useMemo } from "react";

import { Input } from "@/components/ui/input";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSalesData } from "@/hooks/features/sales/useSalesData";
import { formatPrice } from "@/lib/utils";
import type { SaleWithDetails } from "@/types/sales";

interface SalesTableProps {
  initialSales?: SaleWithDetails[];
  dateRange?: { startDate: string; endDate: string };
  timeRange?: { startTime: string; endTime: string };
}

export default function SalesTable({ 
  initialSales = [], 
  dateRange, 
  timeRange 
}: SalesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const filters = useMemo(() => ({
    dateRange,
    timeRange,
    searchQuery
  }), [dateRange, timeRange, searchQuery]);
  
  const { sales, isLoading } = useSalesData(filters, initialSales);
  
  const totalAmount = useMemo(() => 
    sales?.reduce((sum, sale) => sum + parseFloat(sale.totalPrice || '0'), 0) || 0,
    [sales]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  if (isLoading) {
  return (
      <div className="p-4 flex justify-center">
            <LoadingAnimation />
          </div>
                );
  }

  if (!sales || sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40">
        <History className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">
          Δεν υπάρχουν πωλήσεις για την επιλεγμένη περίοδο
        </p>
          </div>
  );
}
  return (
    <div className="space-y-4">
      {/* Search and Total */}
      <div className="flex items-center justify-between gap-4 border rounded-lg p-4 bg-background">
        <div className="relative w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Αναζήτηση..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">Σύνολο:</span>
          <span className="text-sm font-medium">{formatPrice(totalAmount)}</span>
        </div>
      </div>

      {/* Sales List */}
      <div className="border rounded-lg bg-background">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="p-4 space-y-3">
            {sales.map((sale) => (
              <div key={sale.id} className="border rounded-lg p-4 hover:bg-accent/5 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{sale.product?.name || 'Unknown Product'}</h3>
                    <p className="text-sm text-muted-foreground">
                      Ποσότητα: {sale.quantity} × {formatPrice(parseFloat(sale.unitPrice || '0'))}
                    </p>
                    <p className="text-xs text-muted-foreground">
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
