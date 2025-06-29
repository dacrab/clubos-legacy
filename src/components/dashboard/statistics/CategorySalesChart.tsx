"use client";

import { useState, useMemo } from 'react';
import { Medal, BarChart3 } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_SALES_CHART } from '@/lib/constants';
import type { SaleWithDetails, Category } from "@/types/sales";
import { cn } from "@/lib/utils";
import { aggregateSalesByCategory, MEDAL_COLORS } from "@/lib/utils/chart-utils";

interface CategorySalesChartProps {
  sales: SaleWithDetails[];
  categories: Category[];
  subCategories: Record<string, Category[]>;
}

interface CategorySalesItem {
  name: string;
  quantity: number;
  revenue: number;
}

export default function CategorySalesChart({ sales, categories, subCategories }: CategorySalesChartProps) {
  const [selectedCategory, setSelectedCategory] = useState("");

  const categoryData = useMemo((): CategorySalesItem[] => {
    if (!selectedCategory) return [];
    
    // Find the category object to pass its name, not the ID
    const category = [...categories, ...Object.values(subCategories).flat()].find(c => c.id === selectedCategory);
    if (!category) return [];
    
    const data = aggregateSalesByCategory(sales, category.name);
    
    return data.map(item => ({
      name: item.name,
      quantity: item.value,
      revenue: item.total
    }));
  }, [sales, selectedCategory, categories, subCategories]);

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
            {categories.map(category => (
              <SelectGroup key={category.id}>
                <SelectItem value={category.id}>{category.name}</SelectItem>
                {subCategories[category.id]?.map(sub => (
                  <SelectItem key={sub.id} value={sub.id} className="pl-6 text-sm text-muted-foreground">
                    ↳ {sub.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
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
