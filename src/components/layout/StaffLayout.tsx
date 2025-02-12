import { ReactNode } from 'react';

interface StaffLayoutProps {
  children: ReactNode;
}

export const StaffLayout = ({ children }: StaffLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}; 