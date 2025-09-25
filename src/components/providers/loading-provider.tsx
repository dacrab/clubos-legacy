'use client';

import { createContext, useEffect, useState } from 'react';

import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

const LOADING_TIMEOUT = 5000;

type LoadingContextType = {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, LOADING_TIMEOUT); // 5 second timeout

      return () => clearTimeout(timeout);
    }
    return;
  }, [isLoading]);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {isLoading && <LoadingSkeleton className="h-10 w-full" count={3} />}
      {children}
    </LoadingContext.Provider>
  );
}
