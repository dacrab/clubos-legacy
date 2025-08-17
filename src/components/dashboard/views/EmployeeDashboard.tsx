"use client";

// External Dependencies
import { ShoppingBag, Calculator } from "lucide-react";
import { useState } from "react";

// Internal Components
import { useUser } from "@/lib/auth-client";
import { REGISTER_DIALOG } from "@/lib/constants";
import type { SaleWithDetails } from "@/types/sales";

import { CloseRegisterButton } from "../register/CloseRegisterButton";
import AddSaleButton from "../sales/AddSaleButton";
import RecentSales from "../sales/RecentSales";

// Types and Constants removed unused _Profile

interface EmployeeDashboardProps {
  recentSales: SaleWithDetails[];
}

export default function EmployeeDashboard({ recentSales = [] }: EmployeeDashboardProps) {
  // State Management
  const [localRecentSales, setLocalRecentSales] = useState<SaleWithDetails[]>(recentSales);
  
  // Stack Auth
  const user = useUser({ or: 'redirect' });

  // Authorization Check - Stack Auth handles loading and auth state
  if (!user) {
    return null;
  }

  // Main Render
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-full p-4 md:p-6">
      {/* Main Actions Column */}
      <div className="lg:col-span-2 flex flex-col gap-8">
        
        {/* Add Sale Card */}
        <div className="bg-card rounded-2xl border shadow-xs hover:shadow-lg transition-all duration-300">
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
        <div className="bg-card rounded-2xl border shadow-xs hover:shadow-lg transition-all duration-300">
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
