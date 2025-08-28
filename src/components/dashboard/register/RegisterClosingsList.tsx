"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ClipboardList } from "lucide-react";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { EmptyState } from "@/components/ui/empty-state";
import { VirtualizedMobileList } from "@/components/ui/virtualized-mobile-list";
import { cn } from "@/lib/utils";
import { createClientSupabase } from "@/lib/supabase";
import { ALLOWED_USER_ROLES, REGISTER_MESSAGES } from "@/lib/constants";
import { ListItem } from '@/types/register';
import { calculateStats } from '@/types/register';
import RegisterItemCard from './RegisterItemCard';
import { useRegisterSessions } from "@/hooks/useRegisterSessions";

// Constants
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

/**
 * Main component for displaying a list of register closings
 */
export function RegisterClosingsList({
  dateRange
}: {
  dateRange?: {
    startDate: string;
    endDate: string;
  }
}) {
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
  const router = useRouter();
  const supabase = createClientSupabase();

  // Use our custom hook for data fetching
  const {
    sessions,
    isLoading: isSessionsLoading,
    error: sessionsError,
    refreshData
  } = useRegisterSessions(dateRange);

  // Permission check
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push('/');
          return;
        }

        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userDataError || !userData?.role) {
          setError(REGISTER_MESSAGES.NOT_LOGGED_IN);
          setIsAuthorized(false);
          return;
        }

        if (userData.role !== ALLOWED_USER_ROLES[0]) {
          router.push('/dashboard');
          return;
        }

        setIsAuthorized(true);
      } catch (error: any) {
        console.error('Error checking permissions:', error);
        setError(error.message || REGISTER_MESSAGES.FETCH_ERROR);
        setIsAuthorized(false);
      }
    };

    checkPermissions();
  }, [router, supabase]);

  // Handle expanded item toggling
  const toggleExpand = useCallback((id: string): void => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  // Process sessions into display items
  const { closings, activeSessions } = useMemo(() => {
    if (!sessions || !sessions.length) return { closings: [], activeSessions: [] };

    const active: ListItem[] = [];
    const closed: ListItem[] = [];
    
    // Prevent nested circular references with a WeakSet for tracking processed objects
    const processedObjects = new WeakSet();

    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      
      // Skip if we've already processed this session (prevents circular references)
      if (processedObjects.has(session)) {
        console.warn('Circular reference detected in session', session.id);
        continue;
      }
      
      // Mark this session as processed
      processedObjects.add(session);
      
      try {
        if (session.closed_at) {
          if (!session.register_closings || session.register_closings.length === 0) {
            closed.push({
              id: session.id + "-synthetic",
              register_session_id: session.id,
              closed_by_name: session.closed_by_name || "Unknown",
              treats_count: session.orders?.reduce((sum, order) =>
                sum + (order.sales?.filter(s => s.is_treat)?.length || 0), 0) || 0,
              card_count: session.orders?.reduce((sum, order) =>
                sum + (order.card_discount_count || 0), 0) || 0,
              notes: session.notes || {},
              created_at: session.closed_at || session.opened_at,
              session,
              orders: session.orders,
              type: 'closed'
            });
          } else {
            session.register_closings.forEach(closing => {
              closed.push({
                ...closing,
                session,
                orders: session.orders,
                type: 'closed'
              });
            });
          }
        } else {
          active.push({
            ...session,
            type: 'active'
          });
        }
      } catch (err) {
        console.error("Error processing session:", session.id, err);
      }
    }

    return { closings: closed, activeSessions: active };
  }, [sessions]);

  const allItems = useMemo(() => [...activeSessions, ...closings], [activeSessions, closings]);
  
  // Calculate stats once with stable reference
  const statsData = useMemo(() => calculateStats(allItems), [allItems]);

  // Remove redundant polling - useRegisterSessions already handles this
  // Instead, just call refreshData when the component mounts
  useEffect(() => {
    // Initial refresh
    refreshData();
    // No interval needed - it's handled by useRegisterSessions
  }, [refreshData]);

  // Check for mobile view - make this more efficient
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    
    // Set initial value
    checkMobile();
    
    // Add throttled resize listener
    let resizeTimeout: NodeJS.Timeout | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 250);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, []);

  // Update expanded item height with debounce
  useEffect(() => {
    if (!expandedId) return;

    const timeoutId = setTimeout(() => {
      if (expandedItemRef.current) {
        setExpandedHeight(prev => ({
          ...prev,
          [expandedId]: expandedItemRef.current?.getBoundingClientRect()?.height || 400
        }));
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [expandedId]);

  // Update height calculation to use viewport units
  const getListHeight = useCallback(() => {
    if (typeof window === 'undefined') return '70vh';
    // Use a more responsive approach based on viewport height
    return `calc(${window.innerHeight * 0.7}px - 2rem)`;
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
    return <LoadingAnimation />;
  }

  // Handle error states
  if (!isAuthorized || error) {
    return <EmptyState
      icon={AlertCircle}
      title="Σφάλμα"
      description={error || REGISTER_MESSAGES.NOT_LOGGED_IN}
    />;
  }

  if (sessionsError) {
    return <EmptyState
      icon={AlertCircle}
      title="Σφάλμα φόρτωσης δεδομένων"
      description={sessionsError.message}
    />;
  }

  if (!sessions.length) {
    return <EmptyState
      icon={ClipboardList}
      title="Δεν υπάρχουν κλεισίματα ταμείου"
      description="Δεν βρέθηκαν δεδομένα που να ταιριάζουν με τα κριτήρια αναζήτησης."
    />;
  }

  if (!allItems.length) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Σφάλμα επεξεργασίας δεδομένων"
        description={`Βρέθηκαν ${sessions.length} περίοδοι, αλλά δεν μπορούν να εμφανιστούν`}
      />
    );
  }

  const renderDesktopView = () => (
    <div ref={containerRef} style={{ height: listHeight }} className="overflow-auto rounded-lg border-0 sm:border bg-transparent sm:bg-card">
      <div ref={listRef} className="relative w-full p-0 sm:p-4">
        {allItems.map((item, index) => {
          const isActive = item.type === 'active';
          const itemId = isActive ? item.id : item.session.id;
          const isExpanded = expandedId === itemId;

          return (
            <div
              key={`${itemId}-${index}`}
              data-index={index}
              ref={isExpanded ? expandedItemRef : null}
              className={cn(
                "w-full transform mb-4",
                isActive && "bg-primary/5 rounded-lg"
              )}
            >
              <RegisterItemCard
                item={item}
                isExpanded={isExpanded}
                onToggle={toggleExpand}
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
        items={allItems}
        className="rounded-lg overflow-hidden h-full"
        estimateSize={(item) => {
          const itemId = item.type === 'active' ? item.id : item.session.id;
          return expandedId === itemId
            ? (expandedHeight[itemId] || 400)
            : 160;
        }}
        renderItem={(item) => {
          const isActive = item.type === 'active';
          const itemId = isActive ? item.id : item.session.id;
          const isExpanded = expandedId === itemId;

          return (
            <div
              key={`${itemId}`}
              ref={isExpanded ? expandedItemRef : null}
              className={cn(
                "w-full transform mb-3 px-1",
                isActive && "bg-primary/5 rounded-lg"
              )}
            >
              <RegisterItemCard
                item={item}
                isExpanded={isExpanded}
                onToggle={toggleExpand}
              />
            </div>
          );
        }}
      />
    </div>
  );

  return isMobile ? renderMobileView() : renderDesktopView();
}