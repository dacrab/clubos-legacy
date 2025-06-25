"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import { Footer } from "@/components/layout/Footer";
import { cn, formatPrice } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingFallback } from "@/components/loading-fallback";
import { ErrorFallback } from "@/components/error-fallback";
import { useState, useEffect } from "react";
import type { User } from '@supabase/supabase-js';
import SecretariatDashboard from "@/components/dashboard/SecretariatDashboard";
import { UserRole } from "@/lib/constants";

interface UserProfile {
  id: string;
  username: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  user: User;
  profile: UserProfile;
}

export default function DashboardLayoutClient({
  children,
  user,
  profile,
}: DashboardLayoutClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  // Loading effect on route change
  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingFallback />}>
        <div className="flex flex-col flex-1 bg-background">
          {isLoading && <LoadingAnimation />}
          
          <div className="flex flex-col flex-1">
            {profile.role === 'admin' && (
              <div className="hidden lg:block w-72 fixed top-0 left-0 bottom-0 border-r border-border/40 bg-background z-50">
                <Sidebar role={profile.role} />
              </div>
            )}

            {profile.role === 'secretary' ? (
              <SecretariatDashboard user={user} />
            ) : (
              <main className={cn(
                "flex flex-col flex-1",
                profile.role === 'admin' && "lg:pl-72"
              )}>
                <Header user={user} profile={profile} />
                <div className="flex-1 p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8">
                  {children}
                </div>
                {profile.role === 'admin' && (
                  <>
                    <div className="hidden lg:block border-t border-border/40 mt-auto shrink-0">
                      <Footer />
                    </div>
                    <div className="lg:hidden sticky bottom-0 left-0 right-0 bg-background/95 border-t border-border/40 z-50">
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