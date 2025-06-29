import useSWR from 'swr';
import { useCallback, useRef, useMemo } from 'react';
import { createClientSupabase } from '@/lib/supabase/client';
import {
  RegisterSessionWithClosings,
  RegisterClosing,
  DateRange,
  ListItem
} from '@/types/register';

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
    created_at,
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

// Main data fetcher function
const fetcher = async (dateRange?: DateRange): Promise<RegisterSessionWithClosings[]> => {
  const supabase = createClientSupabase();

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
    const closingsBySessionId = (closingsData || []).reduce((acc, closing) => {
      acc[closing.register_session_id] = acc[closing.register_session_id] || [];
      acc[closing.register_session_id].push(closing);
      return acc;
    }, {} as Record<string, RegisterClosing[]>);

    // Transform sessions
    return sessionsData.map(session => {
      const sessionWithClosings = {
        ...session,
        register_closings: closingsBySessionId[session.id] || []
      };
      return sessionWithClosings as unknown as RegisterSessionWithClosings;
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
  if (dateRange?.startDate && dateRange?.endDate) {
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
        console.log('Resetting error count after successful fetch');
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
        setTimeout(() => revalidate({ retryCount }), delay);
      }
    }
  );

  // Create a stable reference to the refresh function
  const refreshData = useCallback(() => {
    return mutate();
  }, [mutate]);

  const allItems = useMemo(() => {
    if (!sessions || !sessions.length) return [];

    const active: ListItem[] = [];
    const closed: ListItem[] = [];

    const processedObjects = new WeakSet();

    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];

      if (processedObjects.has(session)) {
        console.warn('Circular reference detected in session', session.id);
        continue;
      }

      processedObjects.add(session);

      if (session.closed_at) {
        const closings = session.register_closings || [];
        if (closings.length > 0) {
          closings.forEach(closing => {
            closed.push({ ...closing, session, type: 'closed', orders: session.orders || [] });
          });
        } else {
          // Handle case where there's a closed session but no closing entry
          closed.push({
            id: `synthetic-closing-${session.id}`,
            register_session_id: session.id,
            created_at: session.closed_at,
            closed_by_name: session.closed_by_name || 'Unknown',
            treats_count: 0,
            card_count: 0,
            notes: null,
            session,
            type: 'closed',
            orders: session.orders || []
          });
        }
      } else {
        active.push({ ...session, type: 'active' });
      }
    }

    return [...active, ...closed];
  }, [sessions]);

  return {
    sessions,
    allItems,
    error,
    isLoading,
    isValidating,
    refreshData
  };
} 