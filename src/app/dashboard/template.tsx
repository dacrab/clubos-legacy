import { Suspense } from 'react';

import { LoadingAnimation } from '@/components/ui/loading-animation';

export default function DashboardTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingAnimation />}>
      {children}
    </Suspense>
  );
}
