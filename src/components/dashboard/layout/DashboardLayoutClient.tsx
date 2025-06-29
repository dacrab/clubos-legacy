"use client";

import DesktopSidebar from "./DesktopSidebar";
import MobileBottomNav from "./MobileBottomNav";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { LoadingFallback } from "@/components/loading-fallback";
import { ErrorFallback } from "@/components/error-fallback";
import { useState, useEffect } from "react";
import type { User } from '@supabase/supabase-js';
import SecretariatDashboard from "../views/SecretariatDashboard";
import { UserRole } from "@/lib/constants";
import { UserProfile } from "@/types/next-auth";

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
          
          {profile.role === 'admin' && (
            <DesktopSidebar role={profile.role} />
          )}

          {profile.role === 'secretary' ? (
            <SecretariatDashboard user={user} />
          ) : (
            <main className="flex flex-col flex-1">
              <div className="flex-1 p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8">
                  {children}
              </div>
              {profile.role === 'admin' && (
                <>
                  <div className="lg:hidden sticky bottom-0 left-0 right-0 bg-background/95 border-t border-border/40 z-50">
                    <MobileBottomNav role={profile.role} />
                  </div>
                </>
              )}
            </main>
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
} 