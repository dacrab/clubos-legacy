'use client';

import { useCallback, useMemo, useState } from 'react';
import { AlertCircle, Calculator } from 'lucide-react';

import type { DateRange } from '@/types/register';
import { REGISTER_MESSAGES } from '@/lib/constants';
import { useAuthorization } from '@/hooks/auth/useAuthorization';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import RegisterClosingsFilter from '@/components/dashboard/register/RegisterClosingsFilter';
import { RegisterClosingsList } from '@/components/dashboard/register/RegisterClosingsList';

export default function RegisterClosingsPage() {
  const authorizationStatus = useAuthorization();
  // Use a more stable initial state with explicit types
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: '',
  });

  // Optimize filter handler with stable references
  const handleFilterChange = useCallback((range: DateRange) => {
    setDateRange(prev => {
      // Only update if values actually changed to prevent unnecessary renders
      if (prev.startDate === range.startDate && prev.endDate === range.endDate) {
        return prev;
      }
      return range;
    });
  }, []);

  // Header is static and doesn't need to re-render
  const pageHeader = useMemo(
    () => (
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 rounded-full p-3">
            <Calculator className="text-primary h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Κλεισίματα Ταμείου</h1>
            <p className="text-muted-foreground">Διαχείριση και προβολή των κλεισιμάτων ταμείου</p>
          </div>
        </div>
      </div>
    ),
    []
  );

  // Filter component with stable props
  const filterComponent = useMemo(
    () => (
      <div className="mb-6">
        <RegisterClosingsFilter onFilterChange={handleFilterChange} />
      </div>
    ),
    [handleFilterChange]
  );

  // Main list component with stable props
  const listComponent = useMemo(() => <RegisterClosingsList dateRange={dateRange} />, [dateRange]);

  if (authorizationStatus === 'loading') {
    return <LoadingAnimation />;
  }

  if (authorizationStatus === 'unauthorized') {
    return (
      <EmptyState icon={AlertCircle} title="Σφάλμα" description={REGISTER_MESSAGES.NOT_LOGGED_IN} />
    );
  }

  return (
    <div className="bg-background flex flex-1 flex-col p-4 sm:p-6">
      <div className="space-y-6">
        {pageHeader}
        {filterComponent}
        {listComponent}
      </div>
    </div>
  );
}
