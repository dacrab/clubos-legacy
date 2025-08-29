"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { LoadingAnimation } from "@/components/ui/loading-animation";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { DEFAULT_USER_ROLE, UNLIMITED_CATEGORY_ID, LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { createClientSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/supabase";

type Code = Database['public']['Tables']['codes']['Row'] & {
  name: string;
  code: string;
  price: number;
  stock: number;
  category_id: string;
  category?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
};

const hasUnlimitedStock = (categoryId: string | null) => {
  return categoryId === UNLIMITED_CATEGORY_ID;
};

export default function OverviewPage() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          router.push('/');
          return;
        }

        if (profile.role !== DEFAULT_USER_ROLE) {
          router.push('/dashboard');
          return;
        }

        const { data: codesData, error: codesError } = await supabase
          .from('codes')
          .select(`
            *,
            category:category_id (
              name,
              description
            )
          `)
          .order('category(name)', { ascending: true })
          .order('code', { ascending: true })
          .returns();

        if (codesError) {throw codesError;}
        setCodes(codesData || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [router, supabase]);

  if (isLoading) {
    return <LoadingAnimation />;
  }

  return (
    <PageWrapper>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Διαθέσιμοι Κωδικοί</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {codes.map((code) => (
            <div key={code.id} className="p-4 bg-card rounded-lg border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{code.code}</h3>
                  <p className="text-sm text-muted-foreground">{code.category?.name}</p>
                  <p className="text-2xl font-bold mt-2">{code.price}€</p>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded text-sm",
                  hasUnlimitedStock(code.category_id)
                    ? "bg-green-100 text-green-700"
                    : code.stock > LOW_STOCK_THRESHOLD 
                      ? "bg-green-100 text-green-700" 
                      : code.stock > 0 
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                )}>
                  {hasUnlimitedStock(code.category_id) ? "Απεριόριστο" : `${code.stock} τεμ.`}
                </div>
              </div>
              {code.stock <= LOW_STOCK_THRESHOLD && code.stock > 0 && (
                <p className="text-sm text-yellow-600 mt-2">
                  Χαμηλό απόθεμα
                </p>
              )}
              {code.stock === 0 && (
                <p className="text-sm text-red-600 mt-2">
                  Εκτός αποθέματος
                </p>
              )}
            </div>
          ))}
        </div>
        {!codes.length && (
          <div className="text-center text-muted-foreground py-8">
            Δεν υπάρχουν διαθέσιμοι κωδικοί
          </div>
        )}
      </div>
    </PageWrapper>
  );
} 
