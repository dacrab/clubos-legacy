'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface DashboardContextType {
  isSidebarVisible: boolean;
  setSidebarVisible: (visible: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  return (
    <DashboardContext.Provider value={{ isSidebarVisible, setSidebarVisible }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
