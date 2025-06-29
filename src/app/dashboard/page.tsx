import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Database } from '@/types/supabase';
import AdminDashboard from '@/components/dashboard/views/AdminDashboard';
import EmployeeDashboard from '@/components/dashboard/views/EmployeeDashboard';
import type { Product as SaleCode } from '@/types/products';
import { transformOrderToSales, OrderData } from '@/lib/utils/salesUtils';
import { UserRole } from "@/lib/constants";
import { SaleWithDetails } from "@/types/sales";

export default async function DashboardPage() {
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

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/');
  }

  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userDataError) {
    console.error('User error:', userDataError);
    throw userDataError;
  }

  if (!userData) {
    redirect('/');
  }

  // Fetch recent orders with full details
  const { data: recentOrders = [] } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      total_amount,
      final_amount,
      card_discount_count,
      created_by,
      sales (
        id,
        quantity,
        unit_price,
        total_price,
        is_treat,
        coffee_options,
        code:codes (
          id,
          name,
          price,
          image_url,
          category:categories (
            id,
            name,
            description
          )
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(10);

  // If admin, also fetch low stock items with category details
  if (userData.role === 'admin') {
    const { data: lowStock = [] } = await supabase
      .from('codes')
      .select(`
        *,
        category:categories (
          id,
          name,
          description,
          created_at,
          parent_id
        )
      `)
      .lt('stock', 10)
      .neq('stock', -1)
      .order('stock', { ascending: true })
      .limit(10);

    const typedRecentOrders = (recentOrders || []) as unknown as OrderData[];
    
    return <AdminDashboard 
      recentSales={typedRecentOrders.flatMap(order => transformOrderToSales(order))}
      lowStock={lowStock as unknown as SaleCode[]}
    />;
  }

  const typedRecentOrders = (recentOrders || []) as unknown as OrderData[];

  return <EmployeeDashboard 
    recentSales={typedRecentOrders.flatMap(order => transformOrderToSales(order))}
  />;
}