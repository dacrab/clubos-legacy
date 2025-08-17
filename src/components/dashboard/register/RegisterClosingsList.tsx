"use client";

import { AlertCircle, ClipboardList } from "lucide-react";
import { useState, useEffect } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { VirtualizedMobileList } from "@/components/ui/virtualized-mobile-list";
import { useRegisterSessions } from '@/hooks/features/register/useRegisterSessions';
import { useMediaQuery } from "@/hooks/utils/useMediaQuery";
import { cn } from "@/lib/utils";
import type { ListItem, ActiveSession, ClosedSession, RegisterSessionWithClosings } from "@/types/register";

import RegisterItemCard from './RegisterItemCard';

export function RegisterClosingsList({}: {
  dateRange?: {
    startDate: string;
    endDate: string;
  }
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const {
    sessions,
    loading: isLoading,
    error,
    fetchSessions: refreshData
  } = useRegisterSessions();

  // Transform RegisterSessionWithClosings[] to ListItem[]
  const transformToListItems = (sessions: RegisterSessionWithClosings[]): ListItem[] => {
    return sessions.map((session): ListItem => {
      if (session.closed_at) {
        // This is a closed session - create ClosedSession
        return {
          type: 'closed',
          id: session.id,
          register_session_id: session.id,
          closed_by_name: session.closed_by_name || '',
          treats_count: 0, // These would come from the calculation logic
          card_count: 0,   // These would come from the calculation logic
          notes: session.notes,
          created_at: session.created_at,
          session,
          orders: session.orders
        } as ClosedSession;
      } else {
        // This is an active session - create ActiveSession
        return {
          ...session,
          type: 'active',
          orders: session.orders
        } as ActiveSession;
      }
    });
  };

  const allItems = transformToListItems(sessions);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const getItemId = (item: ListItem) => {
    return item.type === 'active' ? item.id : item.session?.id || item.id;
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Σφάλμα φόρτωσης δεδομένων"
        description={error}
      />
    );
  }

  if (!allItems.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Δεν υπάρχουν κλεισίματα ταμείου"
        description="Δεν βρέθηκαν δεδομένα που να ταιριάζουν με τα κριτήρια αναζήτησης."
      />
    );
  }

  const renderItem = (item: ListItem) => {
    const itemId = getItemId(item);
    const isExpanded = expandedId === itemId;
    const isActive = item.type === 'active';

    return (
      <div
        key={itemId}
        className={cn(
          "w-full mb-4",
          isMobile && "px-1 mb-3",
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
  };

  if (isMobile) {
    return (
      <div className="h-[70vh]">
        <VirtualizedMobileList
          items={allItems}
          className="rounded-lg overflow-hidden h-full"
          estimateSize={() => 160}
          renderItem={renderItem}
        />
      </div>
    );
  }

  return (
    <div className="h-[70vh] overflow-auto rounded-lg border bg-card">
      <div className="p-4">
        {allItems.map((item) => renderItem(item))}
      </div>
    </div>
  );
}
