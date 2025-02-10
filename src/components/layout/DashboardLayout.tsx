import { ReactNode } from 'react';
import { UserNav } from '@/components/UserNav';
import { MainNav } from '@/components/MainNav';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <MainNav />
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1 space-y-4 p-4 pt-6">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
}; 