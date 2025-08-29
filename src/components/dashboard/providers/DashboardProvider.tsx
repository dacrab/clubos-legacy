"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AUTH_PAGES } from "@/lib/constants";
import type { Database } from "@/types/supabase";

import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function DashboardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      if (!session) {
        router.push(AUTH_PAGES[0]);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  return children;
}