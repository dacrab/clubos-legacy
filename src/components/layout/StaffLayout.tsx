import { StaffLayoutProps } from '@/types/app';

export const StaffLayout = ({ children }: StaffLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden w-64 flex-shrink-0 bg-white dark:bg-gray-800 shadow-sm md:flex md:flex-col">
        <div className="flex h-16 items-center justify-center border-b px-4">
          <h1 className="text-lg font-semibold">Proteas Dashboard</h1>
        </div>
        <div className="flex flex-1 flex-col space-y-1 p-4">
          {/* Add sidebar navigation items here if needed */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            {/* Mobile menu button */}
            <button className="md:hidden">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Right side items */}
            <div className="flex items-center space-x-4">
              {/* Add any header items here */}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}; 