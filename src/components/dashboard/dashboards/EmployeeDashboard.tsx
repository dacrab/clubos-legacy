"use client";

// External Dependencies
import { createBrowserClient } from "@supabase/ssr";
import { ShoppingBag, Calculator, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

// Internal Components

// Types and Constants
import { type UserRole } from "@/lib/constants";
import { REGISTER_DIALOG } from "@/lib/constants";
import { type Sale } from "@/types/sales";
import { type Database } from "@/types/supabase";

import { CloseRegisterButton } from "../register/CloseRegisterButton";
import AddSaleButton from "../sales/AddSaleButton";
import RecentSales from "../sales/RecentSales";

import type { User } from '@supabase/supabase-js';

interface Profile {
  username: string | null;
  role: UserRole;
  id: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

interface EmployeeDashboardProps {
  recentSales: Sale[];
}

export default function EmployeeDashboard({ recentSales = [] }: EmployeeDashboardProps) {
  // State Management
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [localRecentSales, setLocalRecentSales] = useState<Sale[]>(recentSales);

  // Supabase Client
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Effects
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setIsLoading(false);
          return;
        }

        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userDataError) {
          console.error('User error:', userDataError);
          setIsLoading(false);
          return;
        }

        setUser(user);
        setProfile(userData as Profile);
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void checkAuth();
  }, [supabase]);

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Έλεγχος στοιχείων...</p>
        </div>
      </div>
    );
  }

  // Authorization Check
  if (!user || !profile || profile.role !== 'staff') {
    return null;
  }

  // Main Render
  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {/* Add Sale Card */}
        <div className="group relative overflow-hidden rounded-xl border bg-card hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-primary/10 p-2.5">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Νέα Πώληση</h2>
            </div>
            <div className="w-full">
              <AddSaleButton />
            </div>
          </div>
        </div>

        {/* Close Register Card */}
        <div className="group relative overflow-hidden rounded-xl border bg-card hover:shadow-xl transition-all duration-300">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-primary/10 p-2.5">
                <Calculator className="h-5 w-5 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">{REGISTER_DIALOG.TITLE}</h2>
            </div>
            <div className="w-full">
              <CloseRegisterButton onRegisterClosed={() => setLocalRecentSales([])} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Sales Section */}
      <RecentSales 
        initialSales={localRecentSales} 
        onDeleteClick={(saleId) => {
          setLocalRecentSales(prevSales => prevSales.filter(sale => sale.id !== saleId));
        }}
      />
    </div>
  );
}
