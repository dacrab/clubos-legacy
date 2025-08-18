'use client';

import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import type { UserProfile } from '@/types/stack-auth';
import { useDemoSession } from '@/hooks/useDemoSession';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import { ErrorBoundary } from '@/components/error-boundary';
import { ErrorFallback } from '@/components/error-fallback';
import { LoadingFallback } from '@/components/loading-fallback';

import { useDashboard } from '../provider/DashboardProvider';
import SecretariatDashboard from '../views/SecretariatDashboard';
import { DemoTimer } from './DemoTimer';
import DesktopSidebar from './DesktopSidebar';
import MobileBottomNav from './MobileBottomNav';

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  profile: UserProfile;
}

export default function DashboardLayoutClient({ children, profile }: DashboardLayoutClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const { isDemoSession, remainingTime } = useDemoSession();
  const { setSidebarVisible } = useDashboard();

  // Loading effect on route change
  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname]);

  // Set sidebar visibility based on user role
  useEffect(() => {
    const isAdmin = profile.role === 'admin';
    setSidebarVisible(isAdmin);

    return () => {
      setSidebarVisible(false);
    };
  }, [profile.role, setSidebarVisible]);

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingFallback />}>
        <div className="bg-background flex flex-1 flex-col">
          {isLoading && <LoadingAnimation />}

          {profile.role === 'admin' && <DesktopSidebar role={profile.role} />}

          {profile.role === 'secretary' ? (
            <SecretariatDashboard />
          ) : (
            <main className="flex flex-1 flex-col">
              <div className="xs:p-4 flex-1 p-3 sm:p-5 md:p-6 lg:p-8">{children}</div>
              {profile.role === 'admin' && (
                <>
                  <div className="bg-background/95 border-border/40 sticky right-0 bottom-0 left-0 z-50 border-t lg:hidden">
                    <MobileBottomNav role={profile.role} />
                  </div>
                </>
              )}
            </main>
          )}
          {isDemoSession && remainingTime !== null && <DemoTimer remainingTime={remainingTime} />}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
