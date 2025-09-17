'use client';

import { Calculator } from 'lucide-react';
import { useMemo } from 'react';

import { RegisterClosingsList } from '@/components/dashboard/register/register-closings-list';
import { PageWrapper } from '@/components/ui/page-wrapper';

export default function RegisterClosingsPage() {
  // Header is static and doesn't need to re-render
  const pageHeader = useMemo(
    () => (
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-3">
            <Calculator className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-2xl tracking-tight">Κλεισίματα Ταμείου</h1>
            <p className="text-muted-foreground">Διαχείριση και προβολή των κλεισιμάτων ταμείου</p>
          </div>
        </div>
      </div>
    ),
    []
  );

  // Filter component with stable props
  // Filter removed temporarily until backend filtering is implemented

  // Main list component with stable props
  const listComponent = useMemo(() => <RegisterClosingsList />, []);

  return (
    <PageWrapper>
      <div className="w-full max-w-screen space-y-4 px-2 sm:px-4">
        {pageHeader}
        {/* Filter UI removed */}
        {/* No extra card container to reduce nesting and maximize space */}
        {listComponent}
      </div>
    </PageWrapper>
  );
}
