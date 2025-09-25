'use client';

import { TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aggregateSalesByDate, CHART_STYLES, type SaleLike } from '@/lib/utils/chart-utils';

type SalesChartProps = {
  sales: SaleLike[];
};

// Simplified chart configuration
const CHART_CONFIG = {
  margins: { top: 10, right: 20, left: 0, bottom: 5 },
  line: {
    stroke: CHART_STYLES.colors.primary,
    strokeWidth: 2,
    dot: { r: 3 },
    activeDot: { r: 5 },
  },
};

export default function SalesChart({ sales }: SalesChartProps) {
  const data = useMemo(() => {
    return aggregateSalesByDate(sales, 'quantity', 'Πωλήσεις');
  }, [sales]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-medium text-base">Πωλήσεις ανά Ημέρα</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer>
            <LineChart data={data} margin={CHART_CONFIG.margins}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="date"
                fontSize={12}
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                fontSize={12}
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `${value} τεμ.`}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: CHART_STYLES.tooltip.background,
                  border: `1px solid ${CHART_STYLES.tooltip.border}`,
                  borderRadius: '6px',
                  padding: '8px 12px',
                }}
                cursor={{ stroke: 'hsl(var(--muted)/0.1)' }}
                formatter={(value: number) => [`${value} τεμ.`, 'Πωλήσεις']}
              />
              <Line dataKey="Πωλήσεις" type="monotone" {...CHART_CONFIG.line} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
