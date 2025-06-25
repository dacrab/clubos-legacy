import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Database } from '@/types/supabase';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard';
import type { Sale, Code as SaleCode } from '@/types/sales';
import type { PaymentMethodType } from '@/types/supabase';

interface OrderSale {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_treat: boolean;
  coffee_options: any;
  code?: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    category?: {
      id: string;
      name: string;
      description: string | null;
    } | null;
  };
}

interface OrderData {
  id: string;
  created_at: string;
  total_amount: number;
  discount_amount: number;
  final_amount: number;
  card_discount_count: number;
  payment_method: PaymentMethodType;
  created_by: string;
  sales?: OrderSale[];
}

// Helper function to transform order data to Sale type
function transformOrderToSales(order: OrderData): Sale[] {
  return (order.sales || []).map((sale: OrderSale) => {
    if (!sale.code) {
      throw new Error('Sale must have a code');
    }

    const saleCode: SaleCode = {
      id: sale.code.id,
      name: sale.code.name,
      price: sale.code.price,
      stock: 0, // Default value since it's not in the query
      image_url: sale.code.image_url,
      created_at: order.created_at,
      created_by: order.created_by,
      updated_at: null,
      category_id: sale.code.category?.id || '', // Required by type
      category: sale.code.category ? {
        id: sale.code.category.id,
        name: sale.code.category.name,
        description: sale.code.category.description,
        parent_id: null, // These fields aren't in the query but required by type
        created_at: order.created_at,
        created_by: order.created_by
      } : undefined
    };

    return {
      id: sale.id,
      order_id: order.id,
      code_id: sale.code.id,
      quantity: sale.quantity,
      unit_price: sale.unit_price,
      total_price: sale.total_price,
      is_treat: sale.is_treat,
      coffee_options: sale.coffee_options,
      created_at: order.created_at,
      code: saleCode,
      order: {
        id: order.id,
        register_session_id: '', // Not needed for display
        total_amount: order.total_amount,
        discount_amount: order.discount_amount,
        final_amount: order.final_amount,
        card_discount_count: order.card_discount_count,
        payment_method: order.payment_method,
        created_by: order.created_by,
        created_at: order.created_at
      }
    };
  });
}

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
      discount_amount,
      final_amount,
      card_discount_count,
      payment_method,
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