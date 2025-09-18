import type { ReactNode } from 'react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { PageWrapper } from '@/components/ui/page-wrapper';

type PageContentProps = {
  children: ReactNode;
  loading?: boolean;
  loadingCount?: number;
  loadingClassName?: string;
  className?: string;
  variant?: 'default' | 'dashboard';
};

export function PageContent({ 
  children, 
  loading = false,
  loadingCount = 4,
  loadingClassName = 'h-10 w-full',
  className = '',
  variant = 'default'
}: PageContentProps) {
  if (loading) {
    return <LoadingSkeleton className={loadingClassName} count={loadingCount} />;
  }

  return (
    <PageWrapper variant={variant} className={className}>
      {children}
    </PageWrapper>
  );
}
