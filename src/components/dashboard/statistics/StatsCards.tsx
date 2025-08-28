import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, BarChart2, Gift } from "lucide-react";
import type { Sale } from "@/types/sales";
import { calculateSalesStats } from "@/lib/utils/chart-utils";
import { formatPrice } from "@/lib/utils";

interface StatsCardsProps {
  sales: Sale[];
}

export default function StatsCards({ sales }: StatsCardsProps) {
  const stats = useMemo(() => {
    return calculateSalesStats(sales);
  }, [sales]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Συνολικά Έσοδα
          </CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(stats.totalRevenue)}</div>
          <div className="text-xs text-muted-foreground space-y-0.5 mt-2">
            <div className="flex justify-between">
              <span>Υποσύνολο:</span>
              <span>{formatPrice(stats.totalBeforeDiscounts)}</span>
            </div>
            {stats.cardDiscountCount > 0 && (
              <div className="flex justify-between text-primary">
                <span>Κουπόνια ({stats.cardDiscountCount}x):</span>
                <span>-{formatPrice(stats.cardDiscountAmount)}</span>
              </div>
            )}
            {stats.treatCount > 0 && (
              <div className="flex justify-between text-amber-500">
                <span>Κεράσματα ({stats.treatCount}x):</span>
                <span>({formatPrice(stats.treatsAmount)})</span>
              </div>
            )}
            <div className="flex justify-between font-medium pt-1 border-t mt-1">
              <span>Σύνολο:</span>
              <span>{formatPrice(stats.totalRevenue)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Μέση Αξία Παραγγελίας
          </CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(stats.averageOrderValue)}</div>
          <div className="text-xs text-muted-foreground space-y-0.5 mt-2">
            <p>Συνολικές πωλήσεις: {stats.totalSales} τεμ.</p>
            <p>Μοναδικοί κωδικοί: {stats.uniqueCodes}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Κεράσματα
          </CardTitle>
          <Gift className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.treatCount} τεμ.</div>
          {stats.treatsAmount > 0 && (
            <div className="text-xs text-muted-foreground space-y-0.5 mt-2">
              <div className="flex justify-between">
                <span>Αξία:</span>
                <span className="text-amber-500">{formatPrice(stats.treatsAmount)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}