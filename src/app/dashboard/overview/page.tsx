import { createServerSupabase } from '@/lib/supabase/server';
import { PageWrapper } from "@/components/ui/page-wrapper";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import RecentSales from '@/components/dashboard/sales/RecentSales';
import LowStockCard from "@/components/dashboard/overview/LowStockCard";
import { hasUnlimitedStock } from '@/lib/utils/product';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';
import StatsCards from '@/components/dashboard/statistics/StatsCards';
import { deleteSale } from '@/app/actions/deleteSale';
import { SaleWithDetails } from '@/types/sales';
import { Product } from '@/types/products';

export default async function OverviewPage() {
  const supabase = await createServerSupabase();
  
  const { data: products, error } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .filter('stock', 'lte', LOW_STOCK_THRESHOLD)
    .filter('stock', 'neq', -1)
    .order('stock', { ascending: true })
    .limit(5);

  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('*, order:orders(*), product:products(*, category:categories(*))')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching low stock products:', error);
  }

  if (salesError) {
    console.error('Error fetching sales:', salesError);
  }
  
  const lowStockProducts = products?.filter(p => !hasUnlimitedStock(p.category_id)) || [];
  
  return (
    <PageWrapper>
      <h1 className="text-2xl font-semibold mb-6">Επισκόπηση</h1>
      <StatsCards sales={sales as SaleWithDetails[] || []} />
      <div className="my-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentSales initialSales={sales as SaleWithDetails[] || []} onDeleteClick={deleteSale} />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Χαμηλό Απόθεμα</CardTitle>
              <CardDescription>
                Προϊόντα που τελειώνουν σύντομα.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map(product => (
                  <LowStockCard key={product.id} product={product as Product} />
                ))
              ) : (
                <p className="text-muted-foreground">Δεν υπάρχουν προϊόντα με χαμηλό απόθεμα.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
} 
