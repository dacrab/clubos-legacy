"use client";

// External Dependencies
import { ShoppingBag, Calculator, Loader2 } from "lucide-react";
import type { User } from '@supabase/supabase-js';
import { createBrowserClient } from "@supabase/ssr";
import { useState, useEffect } from "react";

// Internal Components
import { CloseRegisterButton } from "../register/CloseRegisterButton";
import AddSaleButton from "../sales/AddSaleButton";
import RecentSales from "../sales/RecentSales";

// Types and Constants
import { Database } from "@/types/supabase";
import { SaleWithDetails } from "@/types/sales";
import { UserRole } from "@/lib/constants";
import { REGISTER_DIALOG } from "@/lib/constants";

interface Profile {
  username: string | null;
  role: UserRole;
  id: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

interface EmployeeDashboardProps {
  recentSales: SaleWithDetails[];
}

export default function EmployeeDashboard({ recentSales = [] }: EmployeeDashboardProps) {
  // State Management
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [localRecentSales, setLocalRecentSales] = useState<SaleWithDetails[]>(recentSales);

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

    checkAuth();
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
  if (!user || !profile || profile.role !== 'employee') {
    return null;
  }

  // Main Render
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full p-4 md:p-6">
      {/* Main Actions Column */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        
        {/* Add Sale Card */}
        <div className="bg-card rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 text-primary p-3 rounded-xl">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold">Νέα Πώληση</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Ξεκινήστε μια νέα συναλλαγή, προσθέστε προϊόντα και ολοκληρώστε την πώληση.
            </p>
            <AddSaleButton className="w-full" />
          </div>
        </div>

        {/* Close Register Card */}
        <div className="bg-card rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-destructive/10 text-destructive p-3 rounded-xl">
                <Calculator className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold">{REGISTER_DIALOG.TITLE}</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Ολοκληρώστε την ημέρα κάνοντας το κλείσιμο του ταμείου και δείτε τα σύνολα.
            </p>
            <CloseRegisterButton onRegisterClosed={() => setLocalRecentSales([])} />
          </div>
        </div>

      </div>

      {/* Recent Sales Section */}
      <div className="lg:col-span-3">
        <RecentSales 
          initialSales={localRecentSales} 
          onDeleteClick={(saleId) => {
            setLocalRecentSales(prevSales => prevSales.filter(sale => sale.id !== saleId));
          }}
        />
      </div>
    </div>
  );
}
