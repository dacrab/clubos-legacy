"use client";

import { useEffect, useState, useMemo } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { ALLOWED_USER_ROLES } from "@/lib/constants";
import AddProductButton from "@/components/dashboard/products/AddProductButton";
import ManageCategoriesButton from "@/components/dashboard/products/ManageCategoriesButton";
import ProductsTable from "@/components/dashboard/products/ProductsTable";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { Product } from "@/types/products";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClientSupabase();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/');
          return;
        }

        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (!userData?.role) {
          router.push('/');
          return;
        }
        setIsAdmin(userData.role === ALLOWED_USER_ROLES[0]);

        const { data: productsData, error: productsError } = await supabase
          .from('codes')
          .select(`
            *,
            category:categories!codes_category_id_fkey (
              *,
              parent:categories!parent_id(id, name, description)
            )
          `)
          .order('name')
          .returns<Product[]>();

        if (productsError) throw productsError;
        setProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return products;

    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category?.name.toLowerCase().includes(query) ||
      p.category?.parent?.name.toLowerCase().includes(query)
    );
  }, [searchQuery, products]);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Προϊόντα</h1>
          <span className="text-base text-muted-foreground">
            {filteredProducts.length} συνολικά
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Αναζήτηση προϊόντων..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          {isAdmin && (
            <div className="flex flex-row gap-2">
              <AddProductButton />
              <ManageCategoriesButton />
            </div>
          )}
        </div>
      </div>
      <div className="flex-1">
        <ProductsTable products={filteredProducts} isAdmin={isAdmin} />
      </div>
    </div>
  );
} 