'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { AUTH_PAGES } from '@/lib/constants';
import type { Database } from '@/types/supabase';

export default function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!(supabaseUrl && supabaseAnonKey)) {
    throw new Error('Missing Supabase URL or anonymous key');
  }
  const supabase = useMemo(
    () => createBrowserClient<Database>(supabaseUrl, supabaseAnonKey),
    [supabaseUrl, supabaseAnonKey]
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (!session) {
        router.push(AUTH_PAGES[0]);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  return children;
}
