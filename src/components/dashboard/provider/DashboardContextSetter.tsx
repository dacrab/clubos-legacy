"use client";
import { useDashboard } from './DashboardProvider';
import { useEffect } from 'react';

export function DashboardContextSetter({ isSidebarVisible }: { isSidebarVisible: boolean }) {
  const { setSidebarVisible } = useDashboard();
  
  useEffect(() => {
    setSidebarVisible(isSidebarVisible);
    
    return () => {
      setSidebarVisible(false);
    };
  }, [isSidebarVisible, setSidebarVisible]);

  return null;
} 