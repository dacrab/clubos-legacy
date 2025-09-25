'use client';

import { AlertCircle, ClipboardList } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { VirtualizedMobileList } from '@/components/ui/virtualized-mobile-list';
import { useRegisterSessions } from '@/hooks/use-register-sessions';
import { REGISTER_MESSAGES } from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/format';
import { calculateStats } from '@/lib/utils/sales-totals';
import type { ListItem, RegisterSessionWithDetails } from '@/types/register';

import { RegisterItemCard } from './register-item-card';

// Constants
const MOBILE_BREAKPOINT = 768;
const RESIZE_DEBOUNCE = 250;
const EXPAND_ANIMATION_DURATION = 100;
const DEFAULT_ITEM_HEIGHT = 160;
const DEFAULT_EXPANDED_HEIGHT = 400;
const VIEWPORT_HEIGHT_RATIO = 0.7;

// Helper function to process sessions
const processSessions = (sessions: RegisterSessionWithDetails[]) => {
  const closings: ListItem[] = [];
  const activeSessions: ListItem[] = [];

  for (const session of sessions) {
    try {
      if (session.closed_at) {
        if (!session.register_closings || session.register_closings.length === 0) {
          closings.push({
            type: 'closed',
            id: `${session.id}-synthetic`,
            session,
            closing: {
              id: `${session.id}-synthetic`,
              session_id: session.id,
              closed_at: session.closed_at,
              closed_by: session.closed_by || 'Unknown',
              final_cash: session.final_cash || 0,
              total_sales: session.total_sales || 0,
              total_discounts: session.total_discounts || 0,
              notes: session.notes,
              created_at: session.closed_at,
              cash_sales_count: 0,
              cash_sales_total: 0,
              card_sales_count: 0,
              card_sales_total: 0,
              treat_count: 0,
              treat_total: 0,
            },
          });
        } else {
          for (const closing of session.register_closings ?? []) {
            closings.push({
              type: 'closed',
              ...closing,
              session,
            });
          }
        }
      } else {
        activeSessions.push({
          type: 'active',
          id: session.id,
          session,
        });
      }
    } catch (_err) {
      // We can ignore this error, as it's already handled by the hook
    }
  }

  return { closings, activeSessions };
};

/**
 * Main component for displaying a list of register closings
 */
export function RegisterClosingsList() {
  // State
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedHeight, setExpandedHeight] = useState<Record<string, number>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const expandedItemRef = useRef<HTMLDivElement>(null);

  // Hooks
  const supabase = createClientSupabase();

  // Use our custom hook for data fetching
  const {
    sessions,
    isLoading: isSessionsLoading,
    error: sessionsError,
    mutate,
  } = useRegisterSessions();

  // Permission check (simplified): require authenticated user; admins get extra UI
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { data, error: userError } = await supabase.auth.getUser();
        if (userError || !data.user) {
          setError(REGISTER_MESSAGES.NOT_LOGGED_IN);
          setIsAuthorized(false);
          return;
        }
        setIsAuthorized(true);
      } catch (_err) {
        setError(REGISTER_MESSAGES.FETCH_ERROR);
        setIsAuthorized(false);
      }
    };

    checkPermissions();
  }, [supabase]);

  // Process sessions into display items
  const { closings, activeSessions } = useMemo(
    () => processSessions((sessions ?? []) as unknown as RegisterSessionWithDetails[]),
    [sessions]
  );

  // Filtered items based on view option
  const allItems = useMemo(() => [...activeSessions, ...closings], [activeSessions, closings]);

  // Calculate stats once with stable reference
  useMemo(() => calculateStats(allItems), [allItems]);

  // Remove redundant polling - useRegisterSessions already handles this
  // Instead, just call refreshData when the component mounts
  useEffect(() => {
    mutate();
  }, [mutate]);

  // Check for mobile view - make this more efficient
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Set initial value
    checkMobile();

    // Add throttled resize listener
    let resizeTimeout: NodeJS.Timeout | null = null;
    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(checkMobile, RESIZE_DEBOUNCE);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
    };
  }, []);

  // Update expanded item height with debounce
  useEffect(() => {
    if (!expandedId) {
      return;
    }

    const currentExpandedId = expandedId;
    const timeoutId = setTimeout(() => {
      const el = expandedItemRef.current;
      if (el && currentExpandedId) {
        const height = el.getBoundingClientRect().height || DEFAULT_EXPANDED_HEIGHT;
        setExpandedHeight((prev) => ({
          ...prev,
          [currentExpandedId]: height,
        }));
      }
    }, EXPAND_ANIMATION_DURATION);

    return () => clearTimeout(timeoutId);
  }, [expandedId]);

  // Update height calculation to use viewport units
  const getListHeight = useCallback(() => {
    if (typeof window === 'undefined') {
      return '70vh';
    }
    // Use a more responsive approach based on viewport height
    return `calc(${window.innerHeight * VIEWPORT_HEIGHT_RATIO}px - 2rem)`;
  }, []);

  const [listHeight, setListHeight] = useState(getListHeight());

  // Update height on resize
  useEffect(() => {
    const handleResize = () => {
      setListHeight(getListHeight());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getListHeight]);

  // Handle loading states
  if (isAuthorized === null || isSessionsLoading) {
    return <LoadingSkeleton className="h-10 w-full" count={4} />;
  }

  // Handle error states
  if (!isAuthorized || error) {
    return (
      <EmptyState
        description={error || REGISTER_MESSAGES.NOT_LOGGED_IN}
        icon={AlertCircle}
        title="Σφάλμα"
      />
    );
  }

  if (sessionsError) {
    return (
      <EmptyState
        description={sessionsError.message}
        icon={AlertCircle}
        title="Σφάλμα φόρτωσης δεδομένων"
      />
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <EmptyState
        description="Δεν βρέθηκαν δεδομένα που να ταιριάζουν με τα κριτήρια αναζήτησης."
        icon={ClipboardList}
        title="Δεν υπάρχουν κλεισίματα ταμείου"
      />
    );
  }

  if (allItems.length === 0) {
    return (
      <EmptyState
        description={`Βρέθηκαν ${sessions.length} περίοδοι, αλλά δεν μπορούν να εμφανιστούν`}
        icon={AlertCircle}
        title="Σφάλμα επεξεργασίας δεδομένων"
      />
    );
  }

  const renderDesktopView = () => (
    <div
      className="overflow-auto rounded-lg border-0 bg-transparent sm:border sm:bg-card"
      ref={containerRef}
      style={{ height: listHeight }}
    >
      <div className="relative w-full p-0 sm:p-4" ref={listRef}>
        {allItems.map((item, index) => {
          const isActive = item.type === 'active';
          const itemId = isActive ? item.id : item.session.id;
          const isExpanded = expandedId === itemId;

          return (
            <div
              className={cn('mb-4 w-full transform', isActive && 'rounded-lg bg-primary/5')}
              data-index={index}
              key={itemId}
              ref={isExpanded ? expandedItemRef : null}
            >
              <RegisterItemCard
                isExpanded={isExpanded}
                item={item}
                onToggle={() => setExpandedId(isExpanded ? null : itemId)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderMobileView = () => (
    <div style={{ height: listHeight }}>
      <VirtualizedMobileList
        className="h-full overflow-hidden rounded-lg"
        estimateSize={(item) => {
          const itemId = item.type === 'active' ? item.id : item.session.id;
          return expandedId === itemId
            ? expandedHeight[itemId] || DEFAULT_ITEM_HEIGHT
            : DEFAULT_ITEM_HEIGHT;
        }}
        items={allItems}
        renderItem={(item) => {
          const isActive = item.type === 'active';
          const itemId = isActive ? item.id : item.session.id;
          const isExpanded = expandedId === itemId;

          return (
            <div
              className={cn('mb-3 w-full transform px-1', isActive && 'rounded-lg bg-primary/5')}
              key={`${itemId}`}
              ref={isExpanded ? expandedItemRef : null}
            >
              <RegisterItemCard
                isExpanded={isExpanded}
                item={item}
                onToggle={() => setExpandedId(isExpanded ? null : itemId)}
              />
            </div>
          );
        }}
      />
    </div>
  );

  return isMobile ? renderMobileView() : renderDesktopView();
}
