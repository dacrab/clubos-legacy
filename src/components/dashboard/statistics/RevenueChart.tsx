"use client";

import { TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CARD_DISCOUNT } from "@/lib/constants";
import { aggregateSalesByDate, CHART_STYLES } from "@/lib/utils/chart-utils";
import { type Sale } from "@/types/sales";

// Simplified chart configuration
const CHART_CONFIG = {
  margins: { top: 10, right: 20, left: 0, bottom: 5 },
  bar: {
    fill: CHART_STYLES.colors.primary,
    radius: [4, 4, 0, 0] as [number, number, number, number]
  }
};

export default function RevenueChart({ sales }: { sales: Sale[] }) {
  // Calculate net revenue after applying coupon discounts
  const netSales = useMemo(() => {
    // Group sales by order to properly apply discounts
    const salesByOrder = sales.reduce((acc, sale) => {
      if (sale.is_treat || sale.is_deleted) {return acc;} // Skip treats and deleted items
      
      const orderId = sale.order?.id || 'unknown';
      const orderData = acc[orderId] ?? {
        sales: [],
        order: sale.order,
        totalPrice: 0
      };
      
      orderData.sales.push(sale);
      orderData.totalPrice += sale.total_price;
      acc[orderId] = orderData;
      return acc;
    }, {} as Record<string, { sales: Sale[], order: Sale['order'], totalPrice: number }>);

    // Apply discounts per order and distribute proportionally with exact precision
    return Object.values(salesByOrder).flatMap(({ sales, order, totalPrice }) => {
      // If no order or no discount, return sales unchanged
      if (!order || !order.card_discount_count) {return sales;}
      
      // Calculate discount with exact precision
      const orderDiscount = +(order.card_discount_count * CARD_DISCOUNT).toFixed(2);
      
      // Apply discount proportionally to each sale
      return sales.map(sale => {
        // Calculate sale's portion of the total order with exact precision
        const saleRatio = +(sale.total_price / totalPrice).toFixed(6);
        // Calculate sale's portion of discount with exact precision
        const saleDiscount = +(orderDiscount * saleRatio).toFixed(2);
        
        // Create a new sale object with adjusted total_price
        return {
          ...sale,
          // Store original price in a new field
          original_total_price: sale.total_price,
          // Adjust the total_price to reflect the discount with exact precision
          total_price: Math.max(0, +(sale.total_price - saleDiscount).toFixed(2))
        };
      });
    });
  }, [sales]);

  // Use the adjusted sales for the chart with Greek label
  const data = aggregateSalesByDate(netSales, 'total_price', 'Καθαρα Εσοδα');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          Καθαρά Έσοδα ανά Ημέρα
        </CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer>
            <BarChart data={data} margin={CHART_CONFIG.margins}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}€`}
              />
              <Tooltip 
                formatter={(value: number) => `${value.toFixed(2)}€`}
                contentStyle={{
                  backgroundColor: CHART_STYLES.tooltip.background,
                  border: `1px solid ${CHART_STYLES.tooltip.border}`,
                  borderRadius: '6px',
                  padding: '8px 12px'
                }}
                cursor={{ fill: 'hsl(var(--muted)/0.1)' }}
              />
              <Bar 
                dataKey="Καθαρα Εσοδα" 
                fill={CHART_CONFIG.bar.fill}
                radius={CHART_CONFIG.bar.radius}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}