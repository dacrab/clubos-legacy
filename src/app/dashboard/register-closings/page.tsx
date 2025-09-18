'use client';

import { Calculator } from 'lucide-react';

import { RegisterClosingsList } from '@/components/dashboard/register/register-closings-list';
import { PageHeader } from '@/components/dashboard/common/page-header';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useAuth } from '@/hooks/use-auth';

export default function RegisterClosingsPage() {
  const { loading: authLoading } = useAuth({
    redirectOnUnauthorized: true,
  });

  if (authLoading) {
    return <LoadingSkeleton className="h-10 w-full" count={4} />;
  }

  return (
    <div className="w-full max-w-screen space-y-4 px-2 sm:px-4">
      <PageHeader
        icon={Calculator}
        title="Κλεισίματα Ταμείου"
        description="Διαχείριση και προβολή των κλεισιμάτων ταμείου"
      />
      <RegisterClosingsList />
    </div>
  );
}
