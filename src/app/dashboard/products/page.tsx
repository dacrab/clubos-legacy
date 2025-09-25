'use client';

import { useMemo } from 'react';
import { DataTableHeader } from '@/components/dashboard/common/data-table-header';
import { SearchBar } from '@/components/dashboard/common/search-bar';
import AddProductButton from '@/components/dashboard/products/add-product-button';
import ManageProductCategoriesButton from '@/components/dashboard/products/manage-categories-button';
import ProductsTable from '@/components/dashboard/products/products-table';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { usePageState } from '@/hooks/use-page-state';
import type { Category, ProductWithCategory } from '@/types/database';

export default function ProductsPage() {
  const { isAdmin, loading: authLoading } = useAuth({
    redirectOnUnauthorized: true,
  });

  const { products, loading: dataLoading } = useDashboardData({
    isAdmin,
    autoFetch: true,
    enableErrorToasts: false,
  });

  const {
    searchQuery,
    handleSearchChange,
    loading: pageLoading,
  } = usePageState({
    enableErrorToasts: false,
  });

  const isLoading = authLoading || dataLoading || pageLoading;

  // Transform products to match the expected format
  const transformedProducts: ProductWithCategory[] = useMemo(
    () =>
      products.map((p) => ({
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
      })),
    [products]
  );

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return transformedProducts;
    }

    return transformedProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category?.name.toLowerCase().includes(query)
    );
  }, [searchQuery, transformedProducts]);

  const searchBar = (
    <SearchBar
      onChange={handleSearchChange}
      placeholder="Αναζήτηση προϊόντων..."
      value={searchQuery}
    />
  );

  const actions = isAdmin ? (
    <>
      <AddProductButton />
      <ManageProductCategoriesButton />
    </>
  ) : undefined;

  if (isLoading) {
    return <LoadingSkeleton className="h-10 w-full" count={4} />;
  }

  return (
    <div className="flex h-full flex-col">
      <DataTableHeader
        actions={actions}
        count={filteredProducts.length}
        searchBar={searchBar}
        title="Προϊόντα"
      />
      <div className="flex-1">
        <ProductsTable isAdmin={isAdmin} products={filteredProducts} />
      </div>
    </div>
  );
}
