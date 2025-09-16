import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/dashboard/dashboards/admin-dashboard';
import EmployeeDashboard from '@/components/dashboard/dashboards/employee-dashboard';
import { env } from '@/lib/env';
import { getProductsQuery } from '@/lib/utils/products';
import type { Database, UserRole } from '@/types/supabase';

// type OrderSale = {
//   id: string;
//   quantity: number;
//   unit_price: number;
//   total_price: number;
//   is_treat: boolean;
//   coffee_options: Json;
//   products: SaleCode | null;
// };

type ProductRow = Database['public']['Tables']['products']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'];
};

// type OrderData = {
//   id: string;
//   created_at: string;
//   subtotal: number;
//   discount_amount: number;
//   total_amount: number; // replaces legacy final_amount
//   card_discounts_applied: number; // replaces legacy card_discount_count
//   payment_method: PaymentMethodType;
//   created_by: string;
//   order_items?: OrderSale[];
// };

type UserData = { role: UserRole };

// Helper function existed to transform order data to sales after schema changes.
// It's currently unused; keep as reference but disable to satisfy type checks.
// function transformOrderToSales(order: OrderData) { /* ... */ }

export default async function DashboardPage() {
  const cookieStore = await cookies();

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!(supabaseUrl && supabaseAnonKey)) {
    // Handle missing environment variables, maybe redirect to an error page
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

  if (userDataError) {
    throw userDataError;
  }

  if (!userData) {
    redirect('/');
  }

  // No server-side recent orders needed; recent sales load client-side

  // If admin, also fetch low stock items with category details
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
