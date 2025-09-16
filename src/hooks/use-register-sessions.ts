import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

import { createClientSupabase } from '@/lib/supabase';
import type { Order, OrderItem, Product, RegisterClosing, RegisterSession } from '@/types/database';

// Constants for SWR configuration
const REVALIDATE_ON_FOCUS = true;
const REVALIDATE_ON_RECONNECT = true;
const DEDUPING_INTERVAL = 3000;
const FOCUS_THROTTLE_INTERVAL = 3000;
const LOADING_TIMEOUT = 3000;

export type OrderItemWithProduct = OrderItem & { product: Product };
export type OrderWithItems = Order & { order_items: OrderItemWithProduct[] };
// Type definition for a register session with its closings
type RegisterSessionWithDetails = RegisterSession & {
  register_closings: RegisterClosing[];
  orders: OrderWithItems[];
};

/**
 * Custom hook to fetch and manage register sessions.
 * @param {SWRConfiguration} options - SWR configuration options.
 * @returns An object containing the sessions data, loading state, error state, and a mutate function.
 */
export function useRegisterSessions(options?: SWRConfiguration) {
  const fetcher = async (key: string): Promise<RegisterSessionWithDetails[] | null> => {
    const supabase = createClientSupabase();
    let query = supabase.from('register_sessions').select(`
      *,
      register_closings:register_closings(*),
      orders:orders(
        id, created_at, payment_method, created_by,
        subtotal, discount_amount, total_amount, card_discounts_applied,
        order_items:order_items(*, product:products(*, category:categories(*)))
      )
    `);

    // We check for active sessions (closed_at is null) if the key is "register_sessions"
    if (key === 'register_sessions') {
      query = query.is('closed_at', null);
    }

    const { data: sessions, error: fetchError } = (await query.order('opened_at', {
      ascending: false,
    })) as {
      data: RegisterSessionWithDetails[] | null;
      error: unknown;
    };

    if (fetchError) {
      throw fetchError;
    }

    if (!sessions) {
      return [];
    }
    return sessions;
  };

  const { data, error, isLoading, mutate } = useSWR('register_sessions', fetcher, {
    ...options,
    revalidateOnFocus: REVALIDATE_ON_FOCUS,
    revalidateOnReconnect: REVALIDATE_ON_RECONNECT,
    dedupingInterval: DEDUPING_INTERVAL,
    focusThrottleInterval: FOCUS_THROTTLE_INTERVAL,
    loadingTimeout: LOADING_TIMEOUT,
    // onErrorRetry,
  });

  return {
    sessions: data,
    isLoading,
    error,
    mutate,
  };
}
