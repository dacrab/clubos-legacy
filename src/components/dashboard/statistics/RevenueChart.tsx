"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SaleWithDetails } from "@/types/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { aggregateSalesByDate, CHART_STYLES, calculateNetSales } from "@/lib/utils/chart-utils";
import { useMemo } from "react";

interface RevenueChartProps {
  sales: SaleWithDetails[];
}

// Simplified chart configuration
const CHART_CONFIG = {
  margins: { top: 10, right: 20, left: 0, bottom: 5 },
  bar: {
    fill: CHART_STYLES.colors.primary,
    radius: [4, 4, 0, 0] as [number, number, number, number]
  }
};

export default function RevenueChart({ sales }: RevenueChartProps) {
  // Use the new utility function to calculate net sales
  const netSales = useMemo(() => calculateNetSales(sales), [sales]);

  // Use the adjusted sales for the chart
  const data = aggregateSalesByDate(netSales, 'total_price');

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
                dataKey="revenue" 
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