import { redirect } from 'next/navigation';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { History } from 'lucide-react';

import { stackServerApp } from '@/lib/auth';
import { DATE_FORMAT } from '@/lib/constants';
import { getSalesWithDetails } from '@/lib/db/services/sales';
import SalesFilter from '@/components/dashboard/sales/SalesFilter';
import SalesTable from '@/components/dashboard/sales/SalesTable';

interface HistoryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function validateUser() {
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect('/');
  }
  return user;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const params = await searchParams;
  const { from } = params;

  // Redirect if no date range provided
  if (!from) {
    const start = format(startOfMonth(new Date()), DATE_FORMAT.API);
    const end = format(endOfMonth(new Date()), DATE_FORMAT.API);
    redirect(`/dashboard/history?from=${start}&to=${end}&startTime=00:00&endTime=23:59`);
  }

  try {
    await validateUser();

    // Fetch sales using Drizzle service
    const sales = await getSalesWithDetails();

    return (
      <div className="bg-background flex flex-1 flex-col p-4 sm:p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-full p-3">
              <History className="text-primary h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Ιστορικό Πωλήσεων</h1>
              <p className="text-muted-foreground">
                Προβολή και ανάλυση ιστορικών δεδομένων πωλήσεων
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <SalesFilter />
            <SalesTable initialSales={sales} />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') {
        (await import('@/lib/utils/logger')).logger.error('Error fetching sales data:', error);
      }
    }

    return (
      <div className="bg-background flex flex-1 flex-col p-4 sm:p-6">
        <div className="py-12 text-center">
          <p className="text-destructive">Σφάλμα κατά τη φόρτωση των δεδομένων</p>
        </div>
      </div>
    );
  }
}
