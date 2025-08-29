import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

import { API_ERROR_MESSAGES } from '@/lib/constants';

interface PollingConfig<T = void> {
  enabled?: boolean;
  interval?: number;
  onPoll: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  showToast?: boolean;
  maxErrors?: number;
  maxBackoff?: number;
  errorMessage?: string;
  /** Initial delay before first poll (ms) */
  initialDelay?: number;
}

export function usePolling<T = void>({ 
  enabled = true, 
  interval = 5000,
  initialDelay = 0, 
  onPoll,
  onSuccess,
  onError,
  showToast = true,
  maxErrors = 3,
  maxBackoff = 30000, // 30 seconds
  errorMessage
}: PollingConfig<T>) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const errorCountRef = useRef(0);
  const isActiveRef = useRef(true);
  const isPollingRef = useRef(false);
  
  const handleSuccess = useCallback((result: T) => {
    errorCountRef.current = 0;
    if (onSuccess) {
      onSuccess(result);
    }
  }, [onSuccess]);

  const handleError = useCallback((error: any) => {
    errorCountRef.current++;
    const errorObj = error instanceof Error 
      ? error 
      : new Error(errorMessage || (typeof error === 'string' ? error : API_ERROR_MESSAGES.SERVER_ERROR));
    
    console.error('Polling error:', errorObj.message, { errorCount: errorCountRef.current, originalError: error });
    if (onError) {
      onError(errorObj);
    }
    if (showToast && errorCountRef.current <= maxErrors) {
      toast.error(errorObj.message);
    }
  }, [errorMessage, onError, showToast, maxErrors]);

  // Safe polling function that prevents re-entrancy
  const pollFn = useCallback(async () => {
    if (isPollingRef.current || !isActiveRef.current) {return;}
    
    isPollingRef.current = true;
    
    try {
      const result = await onPoll();
      handleSuccess(result);
    } catch (error) {
      handleError(error);
    } finally {
      isPollingRef.current = false;
      // Schedule next poll with backoff
      const backoff = errorCountRef.current > 0 
        ? Math.min(interval * Math.pow(2, errorCountRef.current - 1), maxBackoff) 
        : interval;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => { void pollFn(); }, backoff);
    }
  }, [onPoll, handleSuccess, handleError, interval, maxBackoff]);

  useEffect(() => {
    // Reset state when dependencies change
    isActiveRef.current = enabled;
    
    // Clear any existing timeout to prevent memory leaks
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    
    if (!enabled) {return;}

    // Initial poll with optional delay
    if (initialDelay > 0) {
      timeoutRef.current = setTimeout(() => { void pollFn(); }, initialDelay);
    } else {
      // Start immediately but asynchronously to prevent render phase side effects
      const immediateTimeout = setTimeout(() => { void pollFn(); }, 0);
      timeoutRef.current = immediateTimeout;
    }

    // Cleanup
    return () => {
      isActiveRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };
  }, [enabled, pollFn, initialDelay]);
} 