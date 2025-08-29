"use client";

import { History } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import SalesFilter from '@/components/dashboard/sales/SalesFilter';
import SalesTable from '@/components/dashboard/sales/SalesTable';
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { API_ERROR_MESSAGES } from "@/lib/constants";
import { createClientSupabase } from "@/lib/supabase";
import type { Sale } from '@/types/sales';

interface SalesDateRange {
  startDate: string;
  endDate: string;
}

interface TimeRange {
  startTime: string;
  endTime: string;
}

export default function HistoryPage() {
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientSupabase();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push('/');
          return;
        }

        const { data: _userData, error: userDataError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userDataError) {
          console.error('User error:', userDataError);
          router.push('/');
          return;
        }

        const { data: sales, error: salesError } = await supabase
          .from('sales')
          .select(`
            *,
            code:codes (
              id,
              name,
              price,
              image_url,
              category:categories (
                id,
                name
              )
            ),
            order:orders (
              id,
              created_by,
              created_at,
              final_amount,
              card_discount_count
            )
          `)
          .order('created_at', { ascending: false });

        if (salesError) {
          console.error('Sales error:', salesError);
          throw new Error(salesError.message);
        }

        // Type assertion to handle the type mismatch from the Supabase query
        const typedSales = sales as unknown as Sale[];
        setAllSales(typedSales);
        setFilteredSales(typedSales);
      } catch (error: any) {
        console.error('Error fetching sales:', error);
        toast.error(error.message || API_ERROR_MESSAGES.SERVER_ERROR);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSales();
  }, [router, supabase]);

  const handleFilterChange = (dateRange: SalesDateRange, timeRange: TimeRange) => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setFilteredSales(allSales);
      return;
    }
    
    const startDateTime = new Date(`${dateRange.startDate}T${timeRange.startTime || '00:00:00'}`);
    const endDateTime = new Date(`${dateRange.endDate}T${timeRange.endTime || '23:59:59'}`);
    
    const filtered = allSales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= startDateTime && saleDate <= endDateTime;
    });

    setFilteredSales(filtered);
  };

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center gap-3 sm:gap-4 mb-2">
        <div className="rounded-full bg-primary/10 p-2 sm:p-3">
          <History className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold">Ιστορικό Πωλήσεων</h1>
      </div>
      
      <div className="space-y-5 sm:space-y-6">
        <SalesFilter onFilterChange={handleFilterChange} />
        <SalesTable initialSales={filteredSales} />
      </div>
    </div>
  );
}
