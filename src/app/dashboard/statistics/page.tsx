import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import StatisticsWrapper from '@/components/dashboard/statistics/StatisticsWrapper';
import { SaleWithDetails } from '@/types/sales';

export default async function StatisticsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select(`
      *,
      order:orders(*),
      product:products(*, category:categories(*))
    `)
    .order('created_at', { ascending: false });

  if (salesError) {
    console.error('Error fetching sales:', salesError);
    // Render an error state or return notFound()
    return notFound();
  }
  
  return <StatisticsWrapper initialSales={sales as SaleWithDetails[]} />;
}
