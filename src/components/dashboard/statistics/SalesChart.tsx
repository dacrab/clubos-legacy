"use client";

import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Sale } from "@/types/sales";
import { STATISTICS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart as LineChartIcon } from "lucide-react";
import { aggregateSalesByDate, CHART_STYLES } from "@/lib/utils/chart-utils";

interface SalesChartProps {
  sales: Sale[];
}

const CHART_CONFIG = {
  margin: { top: 10, right: 30, left: 0, bottom: 20 },
  line: {
    stroke: CHART_STYLES.colors.primary,
    strokeWidth: 2,
    dot: { r: 4 },
    activeDot: { r: 6 }
  },
  grid: {
    stroke: CHART_STYLES.grid.stroke
  },
  axis: {
    stroke: CHART_STYLES.axis.stroke,
    fontSize: CHART_STYLES.axis.fontSize
  },
  tooltip: {
    background: CHART_STYLES.tooltip.background,
    border: CHART_STYLES.tooltip.border,
    text: CHART_STYLES.tooltip.text
  }
} as const;

export default function SalesChart({ sales }: SalesChartProps) {
  const data = useMemo(() => {
    return aggregateSalesByDate(sales, 'quantity');
  }, [sales]);

  if (!data.length) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-[300px] text-muted-foreground">
          Δεν υπάρχουν δεδομένα για προβολή
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          Πωλήσεις ανά Ημέρα
        </CardTitle>
        <LineChartIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <LineChart data={data} margin={CHART_CONFIG.margin}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_CONFIG.grid.stroke} vertical={false} />
              <XAxis 
                dataKey="date"
                angle={-45}
                textAnchor="end" 
                height={60}
                interval={0}
                stroke={CHART_CONFIG.axis.stroke}
                fontSize={CHART_CONFIG.axis.fontSize}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={CHART_CONFIG.axis.stroke}
                fontSize={CHART_CONFIG.axis.fontSize}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} τεμ.`}
              />
              <Tooltip
                formatter={(value: number) => [`${value} τεμ.`, 'Ποσότητα']}
                contentStyle={{
                  backgroundColor: CHART_CONFIG.tooltip.background,
                  border: `1px solid ${CHART_CONFIG.tooltip.border}`,
                  borderRadius: '6px',
                  padding: '8px 12px'
                }}
                itemStyle={{ color: CHART_CONFIG.tooltip.text }}
                cursor={{ stroke: 'hsl(var(--muted))' }}
              />
              <Line
                type="monotone"
                dataKey="quantity"
                {...CHART_CONFIG.line}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}