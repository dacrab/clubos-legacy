import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { SaleWithDetails } from '@/types/sales';
import type { Database } from '@/types/supabase';
import { PageWrapper } from "@/components/ui/page-wrapper";
import { ALLOWED_USER_ROLES } from "@/lib/constants";
import StatisticsWrapper from "@/components/dashboard/statistics/StatisticsWrapper";

export const dynamic = 'force-dynamic'

export default async function StatisticsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? '';
        },
      },
    }
  );

  // Authentication check
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect('/');

  // Get user role
  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userDataError || !userData || userData.role !== ALLOWED_USER_ROLES[0]) {
    redirect('/dashboard');
  }

  // Fetch sales data with full code details
  const { data: salesData, error: salesError } = await supabase
    .from('sales')
    .select(`
      *,
      product:codes (
        *,
        category:categories (*)
      ),
      order:orders (*)
    `)
    .order('created_at', { ascending: false });

  if (salesError || !salesData) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="text-center text-destructive">
            Σφάλμα κατά την ανάκτηση των στατιστικών
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <StatisticsWrapper initialSales={salesData} />
    </PageWrapper>
  );
}
