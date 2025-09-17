'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import AddProductButton from '@/components/dashboard/products/add-product-button';
import ManageProductCategoriesButton from '@/components/dashboard/products/manage-categories-button';
import ProductsTable from '@/components/dashboard/products/products-table';
import { Input } from '@/components/ui/input';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useProductManagement } from '@/hooks/use-product-management';
import { useUserManagement } from '@/hooks/use-user-management';
import type { Category, ProductWithCategory } from '@/types/database';

export default function ProductsPage() {
  const {
    profile,
    isAdmin,
    loading: userLoading,
  } = useUserManagement({
    redirectOnUnauthorized: true,
  });

  const { products, loading: productsLoading } = useProductManagement({
    isAdmin,
    autoFetch: !!profile,
    enableErrorToasts: false,
  });

  const [filteredProducts, setFilteredProducts] = useState<ProductWithCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Transform products to match the expected format
  const transformedProducts: ProductWithCategory[] = products.map((p) => ({
    ...p,
    stock: p.stock_quantity,
    image_url: p.image_url ?? null,
    category: p.category
      ? {
          id: p.category.id,
          name: p.category.name,
          description: p.category.description,
          parent_id: p.category.parent_id,
          is_active: p.category.is_active,
          created_at: p.category.created_at,
          updated_at: p.category.updated_at,
          created_by: p.category.created_by,
          parent: (p.category as unknown as { parent?: Category }).parent
            ? {
                id: (p.category as unknown as { parent: Category }).parent.id,
                name: (p.category as unknown as { parent: Category }).parent.name,
                description: (p.category as unknown as { parent: Category }).parent.description,
                parent_id: (p.category as unknown as { parent: Category }).parent.parent_id,
                is_active: (p.category as unknown as { parent: Category }).parent.is_active,
                created_at: (p.category as unknown as { parent: Category }).parent.created_at,
                updated_at: (p.category as unknown as { parent: Category }).parent.updated_at,
                created_by: (p.category as unknown as { parent: Category }).parent.created_by,
              }
            : null,
        }
      : null,
  }));

  const isLoading = userLoading || productsLoading;

  useEffect(() => {
    setFilteredProducts(transformedProducts);
  }, [transformedProducts]);

  // Filter products based on search query
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredProducts(transformedProducts);
      return;
    }

    const filtered = transformedProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category?.name.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, transformedProducts]);

  if (isLoading) {
    return <LoadingSkeleton className="h-10 w-full" count={4} />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-2xl">Προϊόντα</h1>
          <span className="text-base text-muted-foreground">
            {filteredProducts.length} συνολικά
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
            <Input
              className="w-full pl-9"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Αναζήτηση προϊόντων..."
              value={searchQuery}
            />
          </div>
          {isAdmin && (
            <div className="flex flex-row gap-2">
              <AddProductButton />
              <ManageProductCategoriesButton />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1">
        <ProductsTable isAdmin={isAdmin} products={filteredProducts} />
      </div>
    </div>
  );
}
