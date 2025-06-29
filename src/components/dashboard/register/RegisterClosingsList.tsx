"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { AlertCircle, ClipboardList } from "lucide-react";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { EmptyState } from "@/components/ui/empty-state";
import { VirtualizedMobileList } from "@/components/ui/virtualized-mobile-list";
import { cn } from "@/lib/utils";
import { REGISTER_MESSAGES } from "@/lib/constants";
import RegisterItemCard from './RegisterItemCard';
import { useRegisterSessions } from '@/hooks/features/register/useRegisterSessions';
import { useMediaQuery } from "@/hooks/utils/useMediaQuery";

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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedHeight, setExpandedHeight] = useState<Record<string, number>>({});
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const expandedItemRef = useRef<HTMLDivElement>(null);

  // Use our custom hook for data fetching
  const {
    allItems,
    isLoading: isSessionsLoading,
    error: sessionsError,
    refreshData
  } = useRegisterSessions(dateRange);

  // Handle expanded item toggling
  const toggleExpand = useCallback((id: string): void => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  // Initial data refresh
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Update expanded item height
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

  const getListHeight = useCallback(() => {
    if (typeof window === 'undefined') return '70vh';
    return `calc(${window.innerHeight * 0.7}px - 2rem)`;
  }, []);

  const [listHeight, setListHeight] = useState(getListHeight());

  useEffect(() => {
    const handleResize = () => setListHeight(getListHeight());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getListHeight]);

  if (isSessionsLoading) {
    return <LoadingAnimation />;
  }

  if (sessionsError) {
    return <EmptyState
      icon={AlertCircle}
      title="Σφάλμα φόρτωσης δεδομένων"
      description={sessionsError.message}
    />;
  }

  if (!allItems.length) {
    return <EmptyState
      icon={ClipboardList}
      title="Δεν υπάρχουν κλεισίματα ταμείου"
      description="Δεν βρέθηκαν δεδομένα που να ταιριάζουν με τα κριτήρια αναζήτησης."
    />;
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