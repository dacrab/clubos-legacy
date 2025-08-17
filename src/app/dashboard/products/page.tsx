import { notFound } from 'next/navigation';

import AddProductButton from "@/components/dashboard/products/AddProductButton";
import ManageCategoriesButton from "@/components/dashboard/products/ManageCategoriesButton";
import ProductsTable from "@/components/dashboard/products/ProductsTable";
import { stackServerApp } from '@/lib/auth';
import { getProducts } from '@/lib/db/services/products';


export default async function ProductsPage() {
  const user = await stackServerApp.getUser();

  if (!user) {
    return notFound();
  }
  
  // Fetch products with categories using Drizzle service
  await getProducts();

  return (
    <div className="flex flex-col flex-1 bg-background p-4 sm:p-6">
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Προϊόντα</h1>
          <p className="text-muted-foreground">
            Διαχείριση καταλόγου προϊόντων και κατηγοριών
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <AddProductButton />
          <ManageCategoriesButton />
        </div>
        
        <ProductsTable />
      </div>
    </div>
  );
} 