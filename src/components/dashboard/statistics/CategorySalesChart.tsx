"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Medal, BarChart3 } from "lucide-react";
import { useState, useMemo, useEffect } from 'react';
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";
import { CATEGORY_SALES_CHART, API_ERROR_MESSAGES } from '@/lib/constants';
import { cn } from "@/lib/utils";
import { aggregateSalesByCategory, MEDAL_COLORS } from "@/lib/utils/chart-utils";
import { type Sale } from "@/types/sales";
import { type Database } from "@/types/supabase";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface CategorySalesChartProps {
  sales: Sale[];
}

interface CategorySalesItem {
  name: string;
  quantity: number;
  revenue: number;
}

export default function CategorySalesChart({ sales }: CategorySalesChartProps) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Partial<Record<string, Category[]>>>({});

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) {
        toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
        return;
      }

      const mainCategories = data.filter((cat: Category) => !cat.parent_id);
      const subCategoriesMap = data.reduce((acc: Partial<Record<string, Category[]>>, cat: Category) => {
        if (cat.parent_id) {
          (acc[cat.parent_id] = acc[cat.parent_id] ?? []).push(cat);
        }
        return acc;
      }, {} as Partial<Record<string, Category[]>>);

      setCategories(mainCategories);
      setSubCategories(subCategoriesMap);
    }

    void fetchCategories();
  }, [supabase]);

  const categoryData = useMemo((): CategorySalesItem[] => {
    if (!selectedCategory) {return [];}
    
    const data = aggregateSalesByCategory(sales, selectedCategory);
    
    return data.map(item => ({
      name: item.name,
      quantity: item.value,
      revenue: item.total
    }));
  }, [sales, selectedCategory]);

  const maxQuantity = categoryData.length > 0 ? categoryData[0].quantity : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          Πωλήσεις ανά Κατηγορία
        </CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px] relative z-50">
            <SelectValue placeholder={CATEGORY_SALES_CHART.UI.CATEGORY_SELECT_PLACEHOLDER} />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => {
              const subcats = subCategories[category.id];
              return (
                <SelectGroup key={category.id}>
                  <SelectItem value={category.name}>{category.name}</SelectItem>
                  {subcats && subcats.map(sub => (
                    <SelectItem key={sub.id} value={sub.name} className="pl-6 text-sm text-muted-foreground">
                      ↳ {sub.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              );
            })}
          </SelectContent>
        </Select>

        <div className="space-y-2">
          {categoryData.map((item, index) => (
            <div key={item.name} className={cn("flex items-center gap-3 p-2 rounded-lg", index < 3 && "bg-muted/50")}>
              <div className="w-6 text-center">
                {index < 3 ? (
                  <Medal className={cn("w-5 h-5", MEDAL_COLORS[index as keyof typeof MEDAL_COLORS])} />
                ) : (
                  <span className="text-sm text-muted-foreground">{index + 1}</span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium truncate text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{item.quantity} τεμ.</div>
                </div>
                <div className="text-xs text-muted-foreground">{item.revenue.toFixed(2)}€</div>
              </div>

              <div className="w-16">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300" 
                    style={{width: maxQuantity ? `${(item.quantity / maxQuantity) * 100}%` : '0%'}} 
                  />
                </div>
              </div>
            </div>
          ))}

          {selectedCategory && categoryData.length === 0 && (
            <div className="text-center text-muted-foreground py-6 text-sm">
              {CATEGORY_SALES_CHART.EMPTY_STATES.NO_SALES}
            </div>
          )}

          {!selectedCategory && (
            <div className="text-center text-muted-foreground py-6 text-sm">
              {CATEGORY_SALES_CHART.EMPTY_STATES.NO_CATEGORY}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
