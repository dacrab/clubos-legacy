"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sale } from "@/types/sales";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { aggregateSalesByDate, CHART_STYLES } from "@/lib/utils/chart-utils";

interface SalesChartProps {
  sales: Sale[];
}

// Simplified chart configuration
const CHART_CONFIG = {
  margins: { top: 10, right: 20, left: 0, bottom: 5 },
  line: {
    stroke: CHART_STYLES.colors.primary,
    strokeWidth: 2,
    dot: { r: 3 },
    activeDot: { r: 5 }
  }
};

export default function SalesChart({ sales }: SalesChartProps) {
  const data = useMemo(() => {
    return aggregateSalesByDate(sales, 'quantity', 'Πωλήσεις');
  }, [sales]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          Πωλήσεις ανά Ημέρα
        </CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer>
            <LineChart data={data} margin={CHART_CONFIG.margins}>
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
                tickFormatter={(value) => `${value} τεμ.`}
              />
              <Tooltip 
                formatter={(value: number) => [`${value} τεμ.`, 'Πωλήσεις']}
                contentStyle={{
                  backgroundColor: CHART_STYLES.tooltip.background,
                  border: `1px solid ${CHART_STYLES.tooltip.border}`,
                  borderRadius: '6px',
                  padding: '8px 12px'
                }}
                cursor={{ stroke: 'hsl(var(--muted)/0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="Πωλήσεις"
                {...CHART_CONFIG.line}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}