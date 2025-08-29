import { useCallback, useRef } from 'react';
import useSWR from 'swr';

import { createClientSupabase } from '@/lib/supabase';
import { 
  type RegisterSessionWithClosings, 
  type RegisterClosing, 
  type DatabaseRegisterSession,
  type DateRange
, transformSession } from '@/types/register';

// Constants
const ITEMS_PER_PAGE = 50;
const SESSION_QUERY_FIELDS = `
  id,
  opened_at,
  closed_at,
  closed_by_name,
  notes,
  orders (
    id,
    total_amount,
    final_amount,
    card_discount_count,
    sales (
      id,
      quantity,
      unit_price,
      total_price,
      is_treat,
      is_edited,
      is_deleted,
      original_code,
      original_quantity,
      codes (
        id,
        name,
        price
      )
    )
  )
`;

// Safe processing of code objects to prevent circular references
const _processCodesObject = (codes: any) => {
  if (!codes) {return null;}
  
  const codeObject = Array.isArray(codes) && codes.length > 0 ? codes[0] : codes;
  
  return {
    id: codeObject?.id || '',
    name: codeObject?.name || '',
    price: codeObject?.price || 0,
    categories: undefined
  };
};

// Create a fallback session for error cases
const createFallbackSession = (session: any): RegisterSessionWithClosings => ({
  id: session.id,
  opened_at: session.opened_at,
  opened_by: '',
  closed_at: session.closed_at,
  closed_by: null,
  closed_by_name: session.closed_by_name,
  notes: {},
  created_at: session.opened_at,
  register_closings: [],
  orders: []
});

// Main data fetcher function
const fetcher = async (dateRange?: DateRange): Promise<RegisterSessionWithClosings[]> => {
  const supabase = createClientSupabase() as any;
  
  try {
    let query = supabase
      .from('register_sessions')
      .select(SESSION_QUERY_FIELDS)
      .order('opened_at', { ascending: false });
    
    // Apply date filtering if dateRange is provided and has valid dates
    if (dateRange?.startDate && dateRange.endDate) {
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      // Ensure dates are valid before applying filter
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        // Set end date to end of day
        endDate.setHours(23, 59, 59, 999);
        
        query = query
          .gte('opened_at', startDate.toISOString())
          .lte('opened_at', endDate.toISOString());
      }
    }
    
    // Apply limit after filters
    const { data: sessionsData, error: sessionError } = await query.limit(ITEMS_PER_PAGE);

    if (sessionError) {
      console.error('Error fetching sessions:', sessionError);
      throw new Error(sessionError.message || 'Failed to fetch sessions');
    }

    if (!sessionsData || !Array.isArray(sessionsData)) {
      throw new Error('No valid sessions data received');
    }
    
    // If no sessions match the filter, return empty array
    if (sessionsData.length === 0) {
      return [];
    }
    
    // Get all closings in a single query
    const { data: closingsData, error: closingsError } = await supabase
      .from('register_closings')
      .select('*')
      .in('register_session_id', sessionsData.map(s => s.id));
      
    if (closingsError) {
      console.error('Error fetching closings:', closingsError);
    }
    
    // Create lookup table for closings by session ID for O(1) access
    const closingsBySessionId = (closingsData || []).reduce((acc: Record<string, RegisterClosing[]>, closing: RegisterClosing) => {
      (acc[closing.register_session_id] = acc[closing.register_session_id] ?? []).push(closing);
      return acc;
    }, {} as Record<string, RegisterClosing[]>);

    // Transform sessions with proper error handling
    return sessionsData.map(session => {
      const sessionWithClosings = {
        ...session,
        register_closings: closingsBySessionId[session.id] || []
      };
      
      try {
        // Type the session properly to fix the TypeScript error
        // First cast to unknown, then to DatabaseRegisterSession as recommended by the error message
        return transformSession(sessionWithClosings as unknown as DatabaseRegisterSession);
      } catch (err) {
        console.error('Error transforming session:', session.id, err);
        return createFallbackSession(session);
      }
    });
  } catch (error) {
    console.error('Error in fetcher:', error);
    throw error;
  }
};

// Main hook
export function useRegisterSessions(dateRange?: DateRange) {
  // Keep a stable reference to the last used date range to avoid unnecessary refetches
  const lastDateRangeRef = useRef<string>('');
  
  // Add a ref to track if we're having recurring errors to prevent infinite recursion
  const errorCountRef = useRef(0);
  
  // Create a stable key for SWR based on the date range
  let swrKey = 'register-sessions';
  if (dateRange?.startDate && dateRange.endDate) {
    swrKey = `register-sessions-${dateRange.startDate}-${dateRange.endDate}`;
  }
  
  // Only update the reference if the key actually changed
  if (swrKey !== lastDateRangeRef.current) {
    lastDateRangeRef.current = swrKey;
  }
  
  // Use SWR for caching and revalidation with optimized settings
  const { 
    data: sessions,
    error,
    isLoading, 
    isValidating,
    mutate 
  } = useSWR(
    swrKey, 
    () => {
      // Reset error count on successful fetch
      if (errorCountRef.current > 0) {
        // console.log('Resetting error count after successful fetch');
      }
      
      try {
        return fetcher(dateRange);
      } catch (err) {
        // Increment error count and log
        errorCountRef.current += 1;
        console.error(`Fetch error (count: ${errorCountRef.current}):`, err);
        
        // If we have recurring errors, return an empty array to prevent infinite retries
        if (errorCountRef.current > 3) {
          console.error('Too many consecutive errors, returning empty array');
          return [];
        }
        
        throw err;
      }
    },
    { 
      // Configure SWR for performance
      revalidateOnFocus: false,      // Don't revalidate on focus to avoid unnecessary calculations
      revalidateOnReconnect: true,   // Revalidate when reconnecting to ensure fresh data
      refreshInterval: 30000,        // Refresh every 30 seconds
      dedupingInterval: 5000,        // Prevent multiple requests within 5 seconds
      errorRetryCount: 3,            // Limit error retries to prevent cascading failures
      focusThrottleInterval: 10000,  // Throttle focus events to prevent rapid refetches
      loadingTimeout: 5000,          // Set a reasonable timeout for loading state
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Don't retry if we're having recurring errors
        if (errorCountRef.current > 3) {
          console.error('Too many consecutive errors, skipping retry');
          return;
        }
        
        // Custom exponential backoff for error retries
        const delay = Math.min(1000 * 2 ** retryCount, 30000);
        setTimeout(() => {
          void revalidate({ retryCount });
        }, delay);
      }
    }
  );

  // Create a stable reference to the refresh function
  const refreshData = useCallback(() => {
    return mutate();
  }, [mutate]);

  return {
    sessions: sessions || [],
    isLoading,
    isValidating,
    error,
    refreshData,
  };
} 