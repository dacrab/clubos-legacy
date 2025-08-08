"use client";

import { useState, useMemo, useCallback } from "react";
import { Calculator } from "lucide-react";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { RegisterClosingsList } from "@/components/dashboard/register/RegisterClosingsList";
import RegisterClosingsFilter from "@/components/dashboard/register/RegisterClosingsFilter";
import type { DateRange } from "@/types/register";
import { useAuthorization } from "@/hooks/auth/useAuthorization";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { EmptyState } from "@/components/ui/empty-state";
import { AlertCircle } from "lucide-react";
import { REGISTER_MESSAGES } from "@/lib/constants";

export default function RegisterClosingsPage() {
  const authorizationStatus = useAuthorization();
  // Use a more stable initial state with explicit types
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: ''
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
  const pageHeader = useMemo(() => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-primary/10 p-3">
          <Calculator className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Κλεισίματα Ταμείου</h1>
          <p className="text-muted-foreground">
            Διαχείριση και προβολή των κλεισιμάτων ταμείου
          </p>
        </div>
      </div>
    </div>
  ), []);

  // Filter component with stable props
  const filterComponent = useMemo(() => (
    <div className="mb-6">
      <RegisterClosingsFilter onFilterChange={handleFilterChange} />
    </div>
  ), [handleFilterChange]);

  // Main list component with stable props
  const listComponent = useMemo(() => (
    <RegisterClosingsList dateRange={dateRange} />
  ), [dateRange]);
  
  if (authorizationStatus === 'loading') {
    return <LoadingAnimation />;
  }

  if (authorizationStatus === 'unauthorized') {
    return <EmptyState
      icon={AlertCircle}
      title="Σφάλμα"
      description={REGISTER_MESSAGES.NOT_LOGGED_IN}
    />;
  }

  return (
    <PageWrapper>
      <div className="w-full max-w-screen px-2 sm:px-4 space-y-4">
        {pageHeader}
        {filterComponent}
        {/* No extra card container to reduce nesting and maximize space */}
        {listComponent}
      </div>
    </PageWrapper>
  );
}