'use client';

// External Dependencies
import { useState } from 'react';
import { Calculator, ShoppingBag } from 'lucide-react';

import type { SaleWithDetails } from '@/types/sales';
// Internal Components
import { useUser } from '@/lib/auth-client';
import { REGISTER_DIALOG } from '@/lib/constants';

import { CloseRegisterButton } from '../register/CloseRegisterButton';
import AddSaleButton from '../sales/AddSaleButton';
import RecentSales from '../sales/RecentSales';

// Types and Constants removed unused _Profile

interface EmployeeDashboardProps {
  recentSales: SaleWithDetails[];
}

export default function EmployeeDashboard({ recentSales = [] }: EmployeeDashboardProps) {
  // State Management
  const [localRecentSales, setLocalRecentSales] = useState<SaleWithDetails[]>(recentSales);

  // Authentication and authorization
  const user = useUser({ or: 'redirect' });

  if (!user) {
    return null;
  }

  // Main Render
  return (
    <div className="grid h-full grid-cols-1 gap-8 p-4 md:p-6 lg:grid-cols-5">
      {/* Main Actions Column */}
      <div className="flex flex-col gap-8 lg:col-span-2">
        {/* Add Sale Card */}
        <div className="bg-card rounded-2xl border shadow-xs transition-all duration-300 hover:shadow-lg">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-4">
              <div className="bg-primary/10 text-primary rounded-xl p-3">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold">Νέα Πώληση</h3>
            </div>
            <p className="text-muted-foreground mb-6 text-sm">
              Ξεκινήστε μια νέα συναλλαγή, προσθέστε προϊόντα και ολοκληρώστε την πώληση.
            </p>
            <AddSaleButton className="w-full" />
          </div>
        </div>

        {/* Close Register Card */}
        <div className="bg-card rounded-2xl border shadow-xs transition-all duration-300 hover:shadow-lg">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-4">
              <div className="bg-destructive/10 text-destructive rounded-xl p-3">
                <Calculator className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold">{REGISTER_DIALOG.TITLE}</h3>
            </div>
            <p className="text-muted-foreground mb-6 text-sm">
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
          onDeleteClick={saleId => {
            setLocalRecentSales(prevSales => prevSales.filter(sale => sale.id !== saleId));
          }}
        />
      </div>
    </div>
  );
}
