import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import StatisticsServerDisplay from '@/components/dashboard/statistics/_components/StatisticsServerDisplay';
import StatisticsWrapper from '@/components/dashboard/statistics/StatisticsWrapper';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import { stackServerApp } from '@/lib/auth';
import { getSalesWithDetails } from '@/lib/db/services/sales';
import type { SaleWithDetails } from '@/types/sales';

export default async function StatisticsPage() {
  const user = await stackServerApp.getUser();

  if (!user) {
    return notFound();
  }

  // Fetch sales with order and product details using Drizzle service
  let sales: SaleWithDetails[] = [];
  let salesError = null;
  
  try {
    sales = await getSalesWithDetails();
  } catch (error) {
    salesError = error instanceof Error ? error.message : 'Failed to fetch sales';
  }

  if (salesError) {
    if (process.env.NODE_ENV === 'development') {
      (await import('@/lib/utils/logger')).logger.error('Error fetching sales:', salesError);
    }
    return notFound();
  }
  
  return (
    <div className="flex flex-col flex-1 bg-background p-4 sm:p-6">
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Στατιστικά</h1>
          <p className="text-muted-foreground">
            Αναλυτικά στοιχεία πωλήσεων και απόδοσης
          </p>
        </div>
        
        <Suspense fallback={<LoadingAnimation />}>
          {sales.length > 0 ? (
            <StatisticsServerDisplay sales={sales} />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Δεν υπάρχουν δεδομένα πωλήσεων για εμφάνιση
              </p>
            </div>
          )}
        </Suspense>
        
        <StatisticsWrapper initialSales={sales} />
      </div>
    </div>
  );
}
