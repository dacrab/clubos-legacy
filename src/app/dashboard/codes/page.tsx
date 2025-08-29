"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AddCodeButton from "@/components/dashboard/codes/AddCodeButton";
import CodesTable from "@/components/dashboard/codes/CodesTable";
import ManageCategoriesButton from "@/components/dashboard/codes/ManageCategoriesButton";
import { Input } from "@/components/ui/input";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { ALLOWED_USER_ROLES } from "@/lib/constants";
import { createClientSupabase } from "@/lib/supabase";
import type { Code } from "@/types/sales";

export default function CodesPage() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<Code[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const supabase = createClientSupabase() as any;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push('/');
          return;
        }

        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userDataError || !userData || !userData.role) {
          router.push('/');
          return;
        }

        setIsAdmin(userData.role === ALLOWED_USER_ROLES[0]);

        const { data: codesData, error: codesError } = await supabase
          .from('codes')
          .select(`
            *,
            category:categories!codes_category_id_fkey (
              id,
              name,
              description,
              created_at,
              parent_id,
              parent:categories (
                id,
                name,
                description
              )
            )
          `)
          .order('name')
          .returns();

        if (codesError) {throw codesError;}
        setCodes(codesData || []);
        setFilteredCodes(codesData || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [router, supabase]);

  // Filter codes based on search query
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredCodes(codes);
      return;
    }

    const filtered = codes.filter(code => 
      code.name.toLowerCase().includes(query) || 
      code.category?.name.toLowerCase().includes(query)
    );
    setFilteredCodes(filtered);
  }, [searchQuery, codes]);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col gap-4 mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Κωδικοί</h1>
          <span className="text-base text-muted-foreground">
            {filteredCodes.length} συνολικά
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Αναζήτηση κωδικών..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full"
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
        <CodesTable codes={filteredCodes} isAdmin={isAdmin} />
      </div>
    </div>
  );
}