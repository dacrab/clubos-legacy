'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import AddCodeButton from '@/components/dashboard/codes/add-code-button';
import CodesTable from '@/components/dashboard/codes/codes-table';
import ManageCategoriesButton from '@/components/dashboard/codes/manage-categories-button';
import { Input } from '@/components/ui/input';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import { useProductManagement } from '@/hooks/use-product-management';
import { useUserManagement } from '@/hooks/use-user-management';
import type { Category } from '@/types/database';
import type { Database } from '@/types/supabase';

type Code = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  category?:
    | (Database['public']['Tables']['categories']['Row'] & {
        parent?: Database['public']['Tables']['categories']['Row'] | null;
      })
    | null;
};

export default function CodesPage() {
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

  const [filteredProducts, setFilteredProducts] = useState<Code[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Transform products to match the expected format
  const transformedProducts: Code[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
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
    return <LoadingAnimation />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-2xl">Κωδικοί</h1>
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
              placeholder="Αναζήτηση κωδικών..."
              value={searchQuery}
            />
          </div>
          {isAdmin && (
            <div className="flex flex-row gap-2">
              <AddCodeButton />
              <ManageCategoriesButton />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1">
        <CodesTable codes={filteredProducts} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
