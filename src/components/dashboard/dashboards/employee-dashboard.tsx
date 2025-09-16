'use client';

// External Dependencies
import { createBrowserClient } from '@supabase/ssr';
import { Calculator, Loader2, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { env } from '@/lib/env';

// Internal Components

import type { User } from '@supabase/supabase-js';
// Types and Constants
import { REGISTER_DIALOG, type UserRole } from '@/lib/constants';
import type { Database } from '@/types/supabase';
import { CloseRegisterButton } from '../register/close-register-button';
import AddSaleButton from '../sales/add-sale-button';
import RecentSales from '../sales/recent-sales';

type Profile = {
  username: string | null;
  role: UserRole;
  id: string;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
};

type EmployeeDashboardProps = Record<string, never>;

export default function EmployeeDashboard(_props: EmployeeDashboardProps) {
  // State Management
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // Recent sales are now sourced within <RecentSales />; no local state needed here
  const router = useRouter();

  // Supabase Client
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!(supabaseUrl && supabaseAnonKey)) {
    throw new Error('Missing Supabase URL or anonymous key');
  }
  const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

  // Effects
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user: authUser },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !authUser) {
          setIsLoading(false);
          return;
        }

        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (userDataError) {
          setIsLoading(false);
          return;
        }

        setUser(authUser);
        setProfile(userData as Profile);
      } catch (_error) {
        // Silently handle auth check error
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [supabase]);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Έλεγχος στοιχείων...</p>
        </div>
      </div>
    );
  }

  // Authorization Check
  if (!(user && profile) || profile.role !== 'staff') {
    return null;
  }

  // Main Render
  return (
    <div className="space-y-8">
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        {/* Add Sale Card */}
        <div className="group relative overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-xl">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-primary/30 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2.5">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-semibold text-xl">Νέα Πώληση</h2>
            </div>
            <div className="w-full">
              <AddSaleButton />
            </div>
          </div>
        </div>

        {/* Close Register Card */}
        <div className="group relative overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-xl">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-primary/30 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2.5">
                <Calculator className="h-5 w-5 text-destructive" />
              </div>
              <h2 className="font-semibold text-xl">{REGISTER_DIALOG.TITLE}</h2>
            </div>
            <div className="w-full">
              <CloseRegisterButton onRegisterClosed={() => router.refresh()} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales Section */}
      <RecentSales />
    </div>
  );
}
