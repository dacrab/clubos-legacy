"use client";

import { PieChart as PieChartIcon } from "lucide-react";
import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STATISTICS } from "@/lib/constants";
import { aggregateSalesByCode } from "@/lib/utils/chart-utils";
import type { Sale } from "@/types/sales";

interface TopCodesChartProps {
  sales: Sale[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(142.1 76.2% 36.3%)', 
  'hsl(47.9 95.8% 53.1%)',
  'hsl(0 84.2% 60.2%)',
  'hsl(217.2 91.2% 59.8%)'
];

export default function TopCodesChart({ sales }: TopCodesChartProps) {
  const [topCount, setTopCount] = useState<number>(STATISTICS.DEFAULT_TOP_CODES_COUNT);
  const [showAll, setShowAll] = useState(false);

  const data = useMemo(() => {
    return aggregateSalesByCode(sales, topCount, showAll);
  }, [sales, topCount, showAll]);

  const renderLabel = ({ cx, cy, midAngle, percent, outerRadius }: any) => {
    if (percent <= 0.05) {return null;}

    const radius = outerRadius * 0.6;
    const radian = Math.PI / 180;
    const x = cx + radius * Math.cos(-midAngle * radian);
    const y = cy + radius * Math.sin(-midAngle * radian);
  
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

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
          Κορυφαίοι Κωδικοί
        </CardTitle>
        <PieChartIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Label htmlFor="topCount" className="text-sm text-muted-foreground">
              Αριθμός κωδικών ({STATISTICS.MIN_TOP_CODES_COUNT}-{STATISTICS.MAX_TOP_CODES_COUNT})
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="topCount"
                type="number"
                value={topCount}
                onChange={e => {
                  const value = parseInt(e.target.value);
                  if (value >= STATISTICS.MIN_TOP_CODES_COUNT && value <= STATISTICS.MAX_TOP_CODES_COUNT) {
                    setTopCount(value);
                  }
                }}
                className="w-24"
                disabled={showAll}
                min={STATISTICS.MIN_TOP_CODES_COUNT}
                max={STATISTICS.MAX_TOP_CODES_COUNT}
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

        <div className="h-[300px] md:h-[350px]">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                labelLine={false}
                label={renderLabel}
                outerRadius={100}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    strokeWidth={1}
                    stroke="hsl(var(--background))"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value} τεμ.`, name]}
                contentStyle={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: 'hsl(var(--foreground))'
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                formatter={(_, entry: any) => (
                  <span className="text-[11px] md:text-xs text-foreground">
                    {entry.payload.name} ({entry.payload.value} τεμ.)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}