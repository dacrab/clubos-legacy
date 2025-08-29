"use client";

import { usePathname } from "next/navigation";
import { Suspense , useState, useEffect } from "react";

import { ErrorBoundary } from "@/components/error-boundary";
import { ErrorFallback } from "@/components/error-fallback";
import { Footer } from "@/components/layout/Footer";
import { LoadingFallback } from "@/components/loading-fallback";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { type UserRole } from "@/lib/constants";
import { cn } from "@/lib/utils";

import SecretariatDashboard from "../dashboards/SecretariatDashboard";

import Header from "./Header";
import MobileSidebar from "./MobileSidebar";
import Sidebar from "./Sidebar";

import type { User } from '@supabase/supabase-js';

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
        <div className="min-h-screen bg-background">
          {isLoading && <LoadingAnimation />}
          
          <div className="min-h-screen">
            {profile.role === 'admin' && (
              <div className="hidden lg:block w-72 fixed top-0 left-0 bottom-0 border-r border-border/40 bg-background z-50">
                <Sidebar role={profile.role} />
              </div>
            )}

            {profile.role === 'secretary' ? (
              <SecretariatDashboard user={user} />
            ) : (
              <main className={cn(
                "flex flex-col min-h-screen",
                profile.role === 'admin' && "lg:pl-72"
              )}>
                <Header user={user} profile={profile} />
                <div className="flex-1 p-3 xs:p-4 sm:p-5 md:p-6 lg:p-8">
                  {children}
                </div>
                {profile.role === 'admin' && (
                  <>
                    <div className="hidden lg:block border-t border-border/40">
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