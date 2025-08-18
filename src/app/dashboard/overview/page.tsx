import type { Product } from '@/types/products';
import { stackServerApp } from '@/lib/auth';
import { logger } from '@/lib/utils/logger';
import { hasUnlimitedStock } from '@/lib/utils/product';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LowStockCard from '@/components/dashboard/overview/LowStockCard';
import RecentSales from '@/components/dashboard/sales/RecentSales';
import StatsCards from '@/components/dashboard/statistics/StatsCards';
import { deleteSale } from '@/app/actions/deleteSale';
import { getRecentSalesData } from '@/app/actions/fetchSalesData';

export default async function OverviewPage() {
  // Check authentication
  const user = await stackServerApp.getUser();
  if (!user) {
    return null;
  }

  // Fetch data using server actions
  const { sales, error: salesError } = await getRecentSalesData(20);

  // Fetch products using Drizzle service
  const { getProducts } = await import('@/lib/db/services/products');
  let products: Product[] = [];
  let productsError = null;

  try {
    products = await getProducts();
  } catch (error) {
    productsError = error instanceof Error ? error.message : 'Failed to fetch products';
  }

  if (productsError && process.env.NODE_ENV === 'development') {
    logger.error('Error fetching low stock products:', productsError);
  }

  if (salesError && process.env.NODE_ENV === 'development') {
    logger.error('Error fetching sales:', salesError);
  }

  const lowStockProducts = products?.filter(p => !hasUnlimitedStock(p.categoryId)) || [];

  return (
    <div className="bg-background flex flex-1 flex-col p-4 sm:p-6">
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Επισκόπηση</h1>
          <p className="text-muted-foreground">Γενική εικόνα των πωλήσεων και αποθεμάτων</p>
        </div>

        <StatsCards sales={sales} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentSales initialSales={sales} onDeleteClick={deleteSale} />
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Χαμηλό Απόθεμα</CardTitle>
                <CardDescription>Προϊόντα που τελειώνουν σύντομα.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map(product => (
                    <LowStockCard key={product.id} product={product} />
                  ))
                ) : (
                  <p className="text-muted-foreground">Δεν υπάρχουν προϊόντα με χαμηλό απόθεμα.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
