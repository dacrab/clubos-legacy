import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';

import { API_ERROR_MESSAGES } from '@/lib/constants';
import { logger } from '@/lib/utils/logger';

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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const errorCountRef = useRef(0);
  const isActiveRef = useRef(true);
  const isPollingRef = useRef(false);
  
  // Safe polling function that prevents re-entrancy
  const pollFn = useCallback(async () => {
    // Prevent re-entrancy - don't start a new poll if one is already running
    if (isPollingRef.current || !isActiveRef.current) {return;}
    
    isPollingRef.current = true;
    
    try {
      const result = await onPoll();
      
      // Reset error count on successful poll
      errorCountRef.current = 0;
      
      // Only proceed if still active
      if (!isActiveRef.current) {return;}
      
      // Call success callback if provided
      if (onSuccess && result !== undefined) {
        onSuccess(result);
      }
    } catch (error) {
      // Only proceed if still active
      if (!isActiveRef.current) {return;}
      
      errorCountRef.current++;
      
      // Ensure we have a proper Error object with message
      const errorObj = error instanceof Error 
        ? error 
        : new Error(
            errorMessage || 
            (typeof error === 'string' ? error : API_ERROR_MESSAGES.SERVER_ERROR)
          );
            
      // Log error but prevent empty error logs
      logger.error('Polling error:', {
        message: errorObj.message || API_ERROR_MESSAGES.SERVER_ERROR,
        errorCount: errorCountRef.current,
        originalError: error
      });
      
      // Handle error callback
      if (onError) {
        onError(errorObj);
      }

      // Show toast if enabled and under max errors
      if (showToast && errorCountRef.current <= maxErrors) {
        toast.error(errorObj.message || API_ERROR_MESSAGES.SERVER_ERROR);
      }
    } finally {
      // Clear the polling status flag
      isPollingRef.current = false;
      
      // Schedule next poll if still active - outside of try/catch to ensure it always runs
      if (isActiveRef.current) {
        // Calculate backoff if there are errors
        const backoff = errorCountRef.current > 0 
          ? Math.min(interval * Math.pow(2, errorCountRef.current - 1), maxBackoff) 
          : interval;
          
        // Clear any existing timeout to prevent memory leaks
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Set up next poll
        timeoutRef.current = setTimeout(pollFn, backoff);
      }
    }
  }, [
    interval, 
    onPoll, 
    onSuccess, 
    onError, 
    showToast, 
    maxErrors, 
    maxBackoff, 
    errorMessage
  ]);

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
      timeoutRef.current = setTimeout(pollFn, initialDelay);
    } else {
      // Start immediately but asynchronously to prevent render phase side effects
      const immediateTimeout = setTimeout(pollFn, 0);
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