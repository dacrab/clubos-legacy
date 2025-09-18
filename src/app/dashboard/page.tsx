import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/dashboard/dashboards/admin-dashboard';
import EmployeeDashboard from '@/components/dashboard/dashboards/employee-dashboard';
import type { UserRole } from '@/lib/constants';
import { env } from '@/lib/env';
import { getProductsQuery } from '@/lib/utils/products';
import type { Database } from '@/types/supabase';

type ProductRow = Database['public']['Tables']['products']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'];
};

type UserData = { role: UserRole };

export default async function DashboardPage() {
  const cookieStore = await cookies();

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!(supabaseUrl && supabaseAnonKey)) {
    return redirect('/error');
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value ?? '';
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  
  if (userError || !user) {
    redirect('/');
  }

  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userDataError || !userData) {
    redirect('/');
  }

  // If admin, fetch low stock items with category details
  if ((userData as UserData).role === 'admin') {
    const { data: lowStock = [] } = await getProductsQuery(
      supabase as unknown as Parameters<typeof getProductsQuery>[0],
      {
        onlyAvailableForNonAdmin: false,
      }
    )
      .lt('stock_quantity', 10)
      .neq('stock_quantity', -1)
      .order('stock_quantity', { ascending: true })
      .limit(10);

    return (
      <AdminDashboard
        lowStock={
          (lowStock as unknown as ProductRow[]).map((p) => ({
            ...p,
          })) as ProductRow[]
        }
        recentSales={[]}
      />
    );
  }

  return <EmployeeDashboard />;
}
