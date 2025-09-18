'use client';

import type { User } from '@supabase/supabase-js';
import { Suspense, useEffect, useState } from 'react';
import DashboardProvider from '@/components/providers/dashboard-provider';
import { ErrorBoundary } from '@/components/providers/error-boundary';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useSalesData } from '@/hooks/use-sales-data';
import type { UserRole } from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase/client';
import AdminDashboard from '../dashboards/admin-dashboard';
import EmployeeDashboard from '../dashboards/employee-dashboard';
import SecretariatDashboard from '../dashboards/secretariat-dashboard';
import AnimatedContent from './animated-content';
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
  profile: UserProfile;
};

const ROUTE_CHANGE_LOADING_DURATION = 500;

export default function DashboardLayoutClient({ profile }: DashboardLayoutClientProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { sales: recentSales, lowStock } = useSalesData();
  const [user, setUser] = useState<User | null>(null);

  // Fetch current user for header (client-side)
  useEffect(() => {
    const db = createClientSupabase();
    db.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  // Loading effect on route change
  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => setIsLoading(false), ROUTE_CHANGE_LOADING_DURATION);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <DashboardProvider>
      <ErrorBoundary
        fallback={
          <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
            <div className="text-destructive">
              Παρουσιάστηκε σφάλμα κατά τη φόρτωση της εφαρμογής
            </div>
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
        <Suspense fallback={<LoadingSkeleton className="h-10 w-full" count={3} />}>
          <div className="min-h-screen bg-background">
            {isLoading && (
              <div className="p-4">
                <LoadingSkeleton className="h-10 w-full" count={2} />
              </div>
            )}

            <div className="min-h-screen">
              {profile.role === 'admin' && (
                <div className="fixed top-0 bottom-0 left-0 z-50 hidden w-72 border-border/40 border-r bg-background lg:block">
                  <Sidebar role={profile.role} />
                </div>
              )}

              <main className="flex-1 overflow-auto p-4 pb-16 sm:p-6 lg:p-8">
                <Header profile={profile} user={user as unknown as User} />
                <AnimatedContent>
                  {profile.role === 'admin' && (
                    <AdminDashboard lowStock={lowStock} recentSales={recentSales} />
                  )}
                  {profile.role === 'staff' && <EmployeeDashboard />}
                  {profile.role !== 'admin' && profile.role !== 'staff' && <SecretariatDashboard />}
                </AnimatedContent>
                <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background lg:hidden">
                  <MobileSidebar role={profile.role} />
                </div>
              </main>
            </div>
          </div>
        </Suspense>
      </ErrorBoundary>
    </DashboardProvider>
  );
}
