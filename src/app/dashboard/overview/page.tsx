import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cn, formatPrice } from "@/lib/utils";
import { DEFAULT_USER_ROLE, LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { PageWrapper } from "@/components/ui/page-wrapper";
import type { Database } from "@/types/supabase";
import type { Product } from "@/types/products";
import { hasUnlimitedStock } from "@/lib/utils/product";

export default async function OverviewPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    redirect("/");
  }

  if (profile.role !== DEFAULT_USER_ROLE) {
    redirect("/dashboard");
  }

  const { data: codesData, error: codesError } = await supabase
    .from("codes")
    .select(
      `
      *,
      category:categories (
        id,
        name,
        description
      )
    `
    )
    .order("name", { ascending: true })
    .returns<Product[]>();

  if (codesError) {
    console.error("Error fetching codes:", codesError);
    // Optionally return an error message component
  }
  
  const codes = codesData || [];

  return (
    <PageWrapper>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Διαθέσιμοι Κωδικοί</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {codes?.map((code) => (
            <div key={code.id} className="p-4 bg-card rounded-lg border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{code.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {code.category?.name}
                  </p>
                  <p className="text-2xl font-bold mt-2">{formatPrice(code.price)}</p>
                </div>
                <div
                  className={cn(
                    "px-2 py-1 rounded text-sm",
                    hasUnlimitedStock(code.category_id)
                      ? "bg-green-100 text-green-700"
                      : code.stock > LOW_STOCK_THRESHOLD
                      ? "bg-green-100 text-green-700"
                      : code.stock > 0
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  )}
                >
                  {hasUnlimitedStock(code.category_id)
                    ? "Απεριόριστο"
                    : `${code.stock} τεμ.`}
                </div>
              </div>
              {code.stock <= LOW_STOCK_THRESHOLD && code.stock > 0 && !hasUnlimitedStock(code.category_id) && (
                <p className="text-sm text-yellow-600 mt-2">
                  Χαμηλό απόθεμα
                </p>
              )}
              {code.stock === 0 && !hasUnlimitedStock(code.category_id) && (
                <p className="text-sm text-red-600 mt-2">
                  Εκτός αποθέματος
                </p>
              )}
            </div>
          ))}
        </div>
        {!codes?.length && (
          <div className="text-center text-muted-foreground py-8">
            Δεν υπάρχουν διαθέσιμοι κωδικοί
          </div>
        )}
      </div>
    </PageWrapper>
  );
} 
