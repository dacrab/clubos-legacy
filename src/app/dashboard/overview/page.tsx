'use client';

import { Package } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { PageHeader } from '@/components/dashboard/common/page-header';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { LOW_STOCK_THRESHOLD, UNLIMITED_STOCK } from '@/lib/constants';
import { cn } from '@/lib/utils/format';

const hasUnlimitedStock = (stockQuantity: number) => stockQuantity === UNLIMITED_STOCK;

const getStockBadgeClass = (code: { stock_quantity: number }) => {
  if (hasUnlimitedStock(code.stock_quantity) || code.stock_quantity > LOW_STOCK_THRESHOLD) {
    return 'bg-green-100 text-green-700';
  }
  if (code.stock_quantity > 0) {
    return 'bg-yellow-100 text-yellow-700';
  }
  return 'bg-red-100 text-red-700';
};

export default function OverviewPage() {
  const { profile, loading: authLoading } = useAuth({
    redirectOnUnauthorized: true,
  });

  const { products, loading: dataLoading } = useDashboardData({
    isAdmin: true, // Overview always needs admin access
    autoFetch: !!profile,
    enableErrorToasts: false,
  });

  const isLoading = authLoading || dataLoading;

  if (isLoading) {
    return <LoadingSkeleton className="h-10 w-full" count={4} />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Package}
        title="Διαθέσιμοι Κωδικοί"
        description="Προβολή όλων των διαθέσιμων προϊόντων"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((code) => (
          <div className="rounded-lg border bg-card p-4" key={code.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{code.name}</h3>
                <p className="text-muted-foreground text-sm">{code.category?.name}</p>
                <p className="mt-2 font-bold text-2xl">{Number(code.price).toFixed(2)}€</p>
              </div>
              <div
                className={cn(
                  'rounded px-2 py-1 text-sm',
                  getStockBadgeClass({
                    stock_quantity: (code as { stock_quantity: number }).stock_quantity,
                  })
                )}
              >
                {hasUnlimitedStock((code as { stock_quantity: number }).stock_quantity)
                  ? 'Απεριόριστο'
                  : `${(code as { stock_quantity: number }).stock_quantity} τεμ.`}
              </div>
            </div>
            {(code as { stock_quantity: number }).stock_quantity <= LOW_STOCK_THRESHOLD &&
              (code as { stock_quantity: number }).stock_quantity > 0 && (
                <p className="mt-2 text-sm text-yellow-600">Χαμηλό απόθεμα</p>
              )}
            {(code as { stock_quantity: number }).stock_quantity === 0 && (
              <p className="mt-2 text-red-600 text-sm">Εκτός αποθέματος</p>
            )}
          </div>
        ))}
      </div>
      {!products.length && (
        <div className="py-8 text-center text-muted-foreground">
          Δεν υπάρχουν διαθέσιμα προϊόντα
        </div>
      )}
    </div>
  );
}
