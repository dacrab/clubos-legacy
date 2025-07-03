import { createServerSupabase } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { PageWrapper } from "@/components/ui/page-wrapper";
import ProductsTable from "@/components/dashboard/products/ProductsTable";
import AddProductButton from "@/components/dashboard/products/AddProductButton";
import ManageCategoriesButton from "@/components/dashboard/products/ManageCategoriesButton";

export default async function ProductsPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }
  
  const { data: products } = await supabase.from('products').select('*, category:categories(*, parent:categories!parent_id(*))');

  return (
    <PageWrapper>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Προϊόντα</h1>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <AddProductButton />
            <ManageCategoriesButton />
          </div>
        </div>
        <ProductsTable products={products as any || []} isAdmin={true} />
      </div>
    </PageWrapper>
  );
} 