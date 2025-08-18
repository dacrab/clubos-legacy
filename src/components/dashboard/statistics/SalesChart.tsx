'use client';

import { useMemo } from 'react';
import { LineChart as LineChartIcon } from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { SaleWithDetails } from '@/types/sales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalesChartProps {
  sales: SaleWithDetails[];
}

export default function SalesChart({ sales }: SalesChartProps) {
  const chartData = useMemo(() => {
    const salesByDate = sales.reduce(
      (acc, sale) => {
        const date = new Date(sale.createdAt).toLocaleDateString('el-GR');
        acc[date] = (acc[date] || 0) + sale.quantity;
        return acc;
      },
      {} as Record<string, number>
    );
    return Object.entries(salesByDate).map(([date, quantity]) => ({
      date,
      quantity,
    }));
  }, [sales]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground flex h-[300px] items-center justify-center">
          Δεν υπάρχουν δεδομένα για προβολή
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Πωλήσεις ανά Ημέρα</CardTitle>
        <LineChartIcon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
              <YAxis tickFormatter={value => `${value} τεμ.`} />
              <Tooltip formatter={(value: number) => [`${value} τεμ.`, 'Ποσότητα']} />
              <Line type="monotone" dataKey="quantity" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
