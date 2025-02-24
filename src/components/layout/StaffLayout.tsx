import { StaffLayoutProps } from '@/types/app';

export const StaffLayout = ({ children }: StaffLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}; 