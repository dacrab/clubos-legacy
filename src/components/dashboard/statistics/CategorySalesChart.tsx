"use client";

import { Medal, BarChart3 } from "lucide-react";
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { SaleWithDetails, Category } from "@/types/sales";

interface CategorySalesChartProps {
  sales: SaleWithDetails[];
  categories: Category[];
  subCategories: Record<string, Category[]>;
}

export default function CategorySalesChart({ sales, categories, subCategories }: CategorySalesChartProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  // Get all categories (main + sub) in a flat array
  const allCategories = [
    ...categories,
    ...Object.values(subCategories).flat()
  ];

  // Find selected category
  const selectedCategory = allCategories.find(c => c.id === selectedCategoryId);

  // Calculate sales data for selected category
  const getSalesData = () => {
    if (!selectedCategory) {return [];}
    
    const categoryItems = sales
      .filter(sale => sale.product?.category?.name === selectedCategory.name)
      .reduce((acc, sale) => {
        const itemName = sale.product?.name || 'Unknown';
        if (!acc[itemName]) {
          acc[itemName] = { quantity: 0, revenue: 0 };
        }
        acc[itemName].quantity += sale.quantity;
        acc[itemName].revenue += parseFloat(sale.totalPrice);
        return acc;
      }, {} as Record<string, { quantity: number; revenue: number }>);

    return Object.entries(categoryItems)
      .map(([name, data]: [string, { quantity: number; revenue: number }]) => ({ name, count: data.quantity, revenue: data.revenue }))
      .sort((a, b) => b.count - a.count);
  };

  const salesData = getSalesData();
  const maxQuantity = salesData[0]?.count || 0;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          Πωλήσεις ανά Κατηγορία
        </CardTitle>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Επιλέξτε κατηγορία" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <div key={category.id}>
                <SelectItem value={category.id}>{category.name}</SelectItem>
                {subCategories[category.id]?.map(sub => (
                  <SelectItem key={sub.id} value={sub.id} className="pl-6 text-sm text-muted-foreground">
                    ↳ {sub.name}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>

        <div className="space-y-2">
          {salesData.map((item, index) => (
            <div key={item.name} className={cn("flex items-center gap-3 p-2 rounded-lg", index < 3 && "bg-muted/50")}>
              <div className="w-6 text-center">
                {index < 3 ? (
                  <Medal className={cn("w-5 h-5", 
                    index === 0 ? "text-yellow-500" : 
                    index === 1 ? "text-gray-400" : "text-amber-600"
                  )} />
                ) : (
                  <span className="text-sm text-muted-foreground">{index + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium truncate text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{item.count} τεμ.</div>
                </div>
                <div className="text-xs text-muted-foreground">{item.revenue.toFixed(2)}€</div>
              </div>

              <div className="w-16">
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300" 
                    style={{width: `${(item.count / maxQuantity) * 100}%`}} 
                  />
                </div>
              </div>
            </div>
          ))}

          {selectedCategoryId && salesData.length === 0 && (
            <div className="text-center text-muted-foreground py-6 text-sm">
              Δεν υπάρχουν πωλήσεις για αυτή την κατηγορία
            </div>
          )}

          {!selectedCategoryId && (
            <div className="text-center text-muted-foreground py-6 text-sm">
              Επιλέξτε μια κατηγορία για να δείτε τις πωλήσεις
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
