import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import StatisticsWrapper from '@/components/dashboard/statistics/statistics-wrapper';
import { PageWrapper } from '@/components/ui/page-wrapper';
import { ALLOWED_USER_ROLES } from '@/lib/constants';
import { env } from '@/lib/env';
import type { SaleLike } from '@/lib/utils/chart-utils';
import type { OrderItemWithProduct, OrderWithItems } from '@/types/database';
import type { Database, UserRole } from '@/types/supabase';

type UserData = { role: UserRole };

export const dynamic = 'force-dynamic';

export default async function StatisticsPage() {
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

  // Authentication check
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/');
  }

  // Get user role
  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userDataError || !userData || (userData as UserData).role !== ALLOWED_USER_ROLES[0]) {
    redirect('/dashboard');
  }

  // Fetch sales data with full code details
  const { data: ordersData, error: salesError } = await supabase
    .from('orders')
    .select(`
      id, created_at, created_by, payment_method, card_discounts_applied,
      order_items:order_items(
        id, order_id, quantity, unit_price, line_total, is_treat, is_deleted,
        product:products(id, name, image_url, category:categories(id, name))
      )
    `)
    .order('created_at', { ascending: false });

  if (salesError || !ordersData) {
    return (
      <PageWrapper>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="text-center text-destructive">
            Σφάλμα κατά την ανάκτηση των στατιστικών
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <StatisticsWrapper
        initialSales={
          ((ordersData || []) as unknown as OrderWithItems[]).flatMap((order) =>
            (order.order_items || []).map((item: OrderItemWithProduct) => ({
              id: item.id,
              order_id: order.id,
              code_id: item.product.id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.line_total,
              is_treat: item.is_treat,
              payment_method: order.payment_method,
              sold_by: order.created_by,
              created_at: order.created_at,
              is_deleted: item.is_deleted,
              code: {
                name: item.product.name,
                category: (item.product as unknown as { category?: { name: string } }).category
                  ? {
                      name: (item.product as unknown as { category: { name: string } }).category
                        .name,
                    }
                  : null,
              },
              order: {
                id: order.id,
                card_discounts_applied: order.card_discounts_applied,
              },
            }))
          ) as unknown as SaleLike[]
        }
      />
    </PageWrapper>
  );
}
