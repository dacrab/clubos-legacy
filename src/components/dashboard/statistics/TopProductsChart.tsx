'use client';

import { useMemo, useState } from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import type { SaleWithDetails } from '@/types/sales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TopProductsChartProps {
  sales: SaleWithDetails[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(142.1 76.2% 36.3%)',
  'hsl(47.9 95.8% 53.1%)',
  'hsl(0 84.2% 60.2%)',
  'hsl(217.2 91.2% 59.8%)',
];

export default function TopProductsChart({ sales }: TopProductsChartProps) {
  const [topCount, setTopCount] = useState(5);
  const [showAll, setShowAll] = useState(false);

  const data = useMemo(() => {
    const productSales = sales.reduce(
      (acc, sale) => {
        const key = sale.product?.name || 'Unknown Product';
        acc[key] = (acc[key] || 0) + sale.quantity;
        return acc;
      },
      {} as Record<string, number>
    );

    const sorted = Object.entries(productSales)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => (b.value as number) - (a.value as number));

    return showAll ? sorted : sorted.slice(0, topCount);
  }, [sales, topCount, showAll]);

  if (!data.length) {
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
        <CardTitle className="text-base font-medium">Κορυφαία Προϊόντα</CardTitle>
        <PieChartIcon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="topCount" className="text-muted-foreground text-sm">
              Αριθμός προϊόντων (3-10)
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="topCount"
                type="number"
                value={topCount}
                onChange={e => {
                  const value = parseInt(e.target.value);
                  if (value >= 3 && value <= 10) {
                    setTopCount(value);
                  }
                }}
                className="w-24"
                disabled={showAll}
                min={3}
                max={10}
              />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="showAll"
                  checked={showAll}
                  onCheckedChange={checked => setShowAll(!!checked)}
                />
                <Label htmlFor="showAll" className="text-sm font-normal">
                  Εμφάνιση όλων
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" paddingAngle={2}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value} τεμ.`, name]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
