import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PageWrapper } from "@/components/ui/page-wrapper";
import AddSaleButton from "@/components/dashboard/sales/AddSaleButton";
import NewSaleInterface from "@/components/dashboard/sales/NewSaleInterface";
import AdminDashboard from '@/components/dashboard/views/AdminDashboard';
import EmployeeDashboard from '@/components/dashboard/views/EmployeeDashboard';
import SecretariatDashboard from '@/components/dashboard/views/SecretariatDashboard';
import { SaleWithDetails } from '@/types/sales';
import { Product } from '@/types/products';

// This function can be moved to a utils file if it's used elsewhere
const transformOrderToSales = (order: any): SaleWithDetails[] => {
  return order.sales.map((sale: any) => ({
    ...sale,
    order: {
      id: order.id,
      final_amount: order.final_amount,
      card_discount_count: order.card_discount_count
    },
    user: order.user
  }));
};

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }
  
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return notFound();
  }

  // Common data for all roles
  const { data: recentOrders, error: recentOrdersError } = await supabase
    .from('orders')
    .select(`
      *,
      user:users(*),
      sales:sales(*, product:products(*))
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentOrdersError) {
    console.error("Error fetching recent orders", recentOrdersError);
  }

  const recentSales = recentOrders?.flatMap(transformOrderToSales) || [];

  // Role-specific data and component rendering
  switch (profile.role) {
    case 'admin':
      const { data: lowStock } = await supabase
        .from('products')
        .select('*')
        .neq('stock', -1)
        .lte('stock', 10);

      return (
        <AdminDashboard 
          recentSales={recentSales} 
          lowStock={lowStock as Product[]} 
        />
      );
    case 'employee':
      return <EmployeeDashboard recentSales={recentSales} />;
    case 'secretary':
      return <SecretariatDashboard user={user} />;
    default:
      return (
        <PageWrapper>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold tracking-tight">Πωλήσεις</h1>
              <AddSaleButton />
            </div>
            <NewSaleInterface open={false} onOpenChange={() => {}} />
          </div>
        </PageWrapper>
      );
  }
}