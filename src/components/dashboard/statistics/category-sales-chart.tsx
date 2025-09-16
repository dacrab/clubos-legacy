'use client';

import { createBrowserClient } from '@supabase/ssr';
import { BarChart3, Medal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { API_ERROR_MESSAGES, CATEGORY_SALES_CHART } from '@/lib/constants';
import { env } from '@/lib/env';
import type { SaleLike } from '@/lib/utils/chart-utils';
import { aggregateSalesByCategory, MEDAL_COLORS } from '@/lib/utils/chart-utils';
import { cn } from '@/lib/utils/format';
import type { Database } from '@/types/supabase';

type Category = {
  id: string;
  name: string;
  parent_id: string | null;
};

type CategorySalesChartProps = {
  sales: SaleLike[];
};

type CategorySalesItem = {
  name: string;
  quantity: number;
  revenue: number;
};

const TOP_PERFORMERS_COUNT = 3;
const PERCENTAGE_MULTIPLIER = 100;

export default function CategorySalesChart({ sales }: CategorySalesChartProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Partial<Record<string, Category[]>>>({});

  const supabase = useMemo(() => {
    return createBrowserClient<Database>(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*').order('name');

      if (error) {
        toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
        return;
      }

      const mainCategories = data.filter((cat: Category) => !cat.parent_id);
      const subCategoriesMap = data.reduce(
        (acc: Partial<Record<string, Category[]>>, cat: Category) => {
          if (cat.parent_id) {
            const parent = acc[cat.parent_id] ?? [];
            parent.push(cat);
            acc[cat.parent_id] = parent;
          }
          return acc;
        },
        {} as Partial<Record<string, Category[]>>
      );

      setCategories(mainCategories);
      setSubCategories(subCategoriesMap);
    };

    fetchCategories().catch((_e) => {
      toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
    });
  }, [supabase]);

  const categoryData = useMemo((): CategorySalesItem[] => {
    if (!selectedCategory) {
      return [];
    }

    const data = aggregateSalesByCategory(sales, selectedCategory);

    return data.map((item) => ({
      name: item.name,
      quantity: item.value,
      revenue: item.total,
    }));
  }, [sales, selectedCategory]);

  const maxQuantity = categoryData[0]?.quantity ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-base">Πωλήσεις ανά Κατηγορία</CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Select onValueChange={setSelectedCategory} value={selectedCategory}>
          <SelectTrigger className="relative z-50 w-[180px]">
            <SelectValue placeholder={CATEGORY_SALES_CHART.UI.CATEGORY_SELECT_PLACEHOLDER} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => {
              const subcats = subCategories[category.id];
              return (
                <SelectGroup key={category.id}>
                  <SelectItem value={category.name}>{category.name}</SelectItem>
                  {subcats?.map((sub) => (
                    <SelectItem
                      className="pl-6 text-muted-foreground text-sm"
                      key={sub.id}
                      value={sub.name}
                    >
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
            <div
              className={cn(
                'flex items-center gap-3 rounded-lg p-2',
                index < TOP_PERFORMERS_COUNT && 'bg-muted/50'
              )}
              key={item.name}
            >
              <div className="w-6 text-center">
                {index < TOP_PERFORMERS_COUNT ? (
                  <Medal
                    className={cn('h-5 w-5', MEDAL_COLORS[index as keyof typeof MEDAL_COLORS])}
                  />
                ) : (
                  <span className="text-muted-foreground text-sm">{index + 1}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate font-medium text-sm">{item.name}</div>
                  <div className="whitespace-nowrap text-muted-foreground text-xs">
                    {item.quantity} τεμ.
                  </div>
                </div>
                <div className="text-muted-foreground text-xs">{item.revenue.toFixed(2)}€</div>
              </div>

              <div className="w-16">
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width: maxQuantity
                        ? `${(item.quantity / maxQuantity) * PERCENTAGE_MULTIPLIER}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
            </div>
          ))}

          {selectedCategory && categoryData.length === 0 && (
            <div className="py-6 text-center text-muted-foreground text-sm">
              {CATEGORY_SALES_CHART.EMPTY_STATES.NO_SALES}
            </div>
          )}

          {!selectedCategory && (
            <div className="py-6 text-center text-muted-foreground text-sm">
              {CATEGORY_SALES_CHART.EMPTY_STATES.NO_CATEGORY}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
