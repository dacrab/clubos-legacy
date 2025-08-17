"use client";

import { usePathname } from "next/navigation";
import { Suspense , useState, useEffect } from "react";

import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorFallback } from "@/components/error-fallback";
import { LoadingFallback } from "@/components/loading-fallback";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { useDemoSession } from "@/hooks/useDemoSession";
import type { UserProfile } from "@/types/stack-auth";

import { DemoTimer } from "./DemoTimer";
import DesktopSidebar from "./DesktopSidebar";
import MobileBottomNav from "./MobileBottomNav";
import { useDashboard } from "../provider/DashboardProvider";
import SecretariatDashboard from "../views/SecretariatDashboard";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  profile: UserProfile;
}

export default function DashboardLayoutClient({
  children,
  profile,
}: DashboardLayoutClientProps) {
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
        <div className="flex flex-col flex-1 bg-background">
          {isLoading && <LoadingAnimation />}
          
          {profile.role === 'admin' && (
            <DesktopSidebar role={profile.role} />
          )}

          {profile.role === 'secretary' ? (
            <SecretariatDashboard />
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
          {isDemoSession && remainingTime !== null && (
            <DemoTimer remainingTime={remainingTime} />
          )}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
} 