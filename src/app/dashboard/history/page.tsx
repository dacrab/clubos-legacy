import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { History } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import SalesTable from '@/components/dashboard/sales/SalesTable';
import SalesFilter from '@/components/dashboard/sales/SalesFilter';
import { DATE_FORMAT } from "@/lib/constants";
import type { Sale, SaleWithDetails } from '@/types/sales';
import type { Database } from "@/types/supabase";
import { PageWrapper } from "@/components/ui/page-wrapper";

interface HistoryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  const resolvedParams = await searchParams;
  const { from, to, startTime, endTime } = resolvedParams;

  if (!from) {
    const start = format(startOfMonth(new Date()), DATE_FORMAT.API);
    const end = format(endOfMonth(new Date()), DATE_FORMAT.API);
    return redirect(`/dashboard/history?from=${start}&to=${end}&startTime=00:00&endTime=23:59`);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set(name, value, options);
        },
        remove(name, options) {
          cookieStore.delete({ name, ...options });
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

  if (userDataError || !userData) {
    redirect('/');
  }

  const startDateTime = `${from}T${startTime || '00:00:00'}`;
  const endDateTime = `${to || from}T${endTime || '23:59:59'}`;

  const query = supabase
    .from('sales')
    .select(`
      *,
      product:codes (
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
    .order('created_at', { ascending: false })
    .gte('created_at', startDateTime)
    .lte('created_at', endDateTime);
    
  const { data: sales, error: salesError } = await query;

  if (salesError) {
    // A more sophisticated error UI could be rendered here
    return <PageWrapper>Error loading sales data.</PageWrapper>;
  }
  
  const typedSales = sales as unknown as SaleWithDetails[];

  return (
    <PageWrapper>
      <div className="space-y-5 sm:space-y-6">
        <div className="flex items-center gap-3 sm:gap-4 mb-2">
          <div className="rounded-full bg-primary/10 p-2 sm:p-3">
            <History className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold">Ιστορικό Πωλήσεων</h1>
        </div>
        
        <div className="space-y-5 sm:space-y-6">
          <SalesFilter />
          <SalesTable initialSales={typedSales} />
        </div>
      </div>
    </PageWrapper>
  );
}
