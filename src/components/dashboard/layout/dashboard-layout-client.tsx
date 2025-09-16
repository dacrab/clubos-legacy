'use client';

import type { User } from '@supabase/supabase-js';
import { Suspense, useEffect, useState } from 'react';
import { Footer } from '@/components/layout/footer';
import { ErrorBoundary } from '@/components/providers/error-boundary';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import type { UserRole } from '@/lib/constants';
import { cn } from '@/lib/utils/format';
import SecretariatDashboard from '../dashboards/secretariat-dashboard';
import Header from './header';
import MobileSidebar from './mobile-sidebar';
import Sidebar from './sidebar';

type UserProfile = {
  id: string;
  username: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

type DashboardLayoutClientProps = {
  children: React.ReactNode;
  user: User;
  profile: UserProfile;
};

const ROUTE_CHANGE_LOADING_DURATION = 500;

export default function DashboardLayoutClient({
  children,
  user,
  profile,
}: DashboardLayoutClientProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Loading effect on route change
  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => setIsLoading(false), ROUTE_CHANGE_LOADING_DURATION);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <ErrorBoundary
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
          <div className="text-destructive">Παρουσιάστηκε σφάλμα κατά τη φόρτωση της εφαρμογής</div>
          <button
            className="rounded-md border border-input bg-background px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            onClick={() => window.location.reload()}
            type="button"
          >
            Ανανέωση
          </button>
        </div>
      }
    >
      <Suspense fallback={<LoadingAnimation />}>
        <div className="min-h-screen bg-background">
          {isLoading && <LoadingAnimation />}

          <div className="min-h-screen">
            {profile.role === 'admin' && (
              <div className="fixed top-0 bottom-0 left-0 z-50 hidden w-72 border-border/40 border-r bg-background lg:block">
                <Sidebar role={profile.role} />
              </div>
            )}

            {profile.role === 'secretary' ? (
              <SecretariatDashboard user={user} />
            ) : (
              <main
                className={cn('flex min-h-screen flex-col', profile.role === 'admin' && 'lg:pl-72')}
              >
                <Header profile={profile} user={user} />
                <div className="flex-1 p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8">{children}</div>
                {profile.role === 'admin' && (
                  <>
                    <div className="hidden border-border/40 border-t lg:block">
                      <Footer />
                    </div>
                    <div className="sticky right-0 bottom-0 left-0 z-50 border-border/40 border-t bg-background/95 lg:hidden">
                      <MobileSidebar role={profile.role} />
                    </div>
                  </>
                )}
              </main>
            )}
          </div>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}
