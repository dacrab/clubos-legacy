"use client";

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Sale } from "@/types/sales";
import { STATISTICS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon, Medal } from "lucide-react";
import { aggregateSalesByCode, ChartDataItem, MEDAL_COLORS } from "@/lib/utils/chart-utils";
import { formatPrice } from "@/lib/utils";

interface TopCodesChartProps {
  sales: Sale[];
}

// Using colors from chart-utils for consistency
const COLORS = [
  'hsl(var(--primary))',
  'hsl(142.1 76.2% 36.3%)', 
  'hsl(47.9 95.8% 53.1%)',
  'hsl(0 84.2% 60.2%)',
  'hsl(217.2 91.2% 59.8%)'
];

const CHART_CONFIG = {
  pieConfig: {
    cx: "50%",
    cy: "45%",
    outerRadius: 100,
    labelRadius: 60,
    minPercentForLabel: 0.05
  },
  styles: {
    tooltip: {
      background: 'hsl(var(--background))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
      padding: '8px 12px',
      color: 'hsl(var(--foreground))'
    },
    legend: {
      fontSize: '11px',
      padding: '4px 8px',
      borderRadius: '9999px',
      background: 'hsl(var(--muted)/0.5)'
    }
  }
};

export default function TopCodesChart({ sales }: TopCodesChartProps) {
  const [topCount, setTopCount] = useState<number>(STATISTICS.DEFAULT_TOP_CODES_COUNT);
  const [showAll, setShowAll] = useState(false);

  const data = useMemo(() => {
    return aggregateSalesByCode(sales, topCount, showAll);
  }, [sales, topCount, showAll]);

  const renderLabel = ({ cx, cy, midAngle, outerRadius, percent }: any) => {
    if (percent <= CHART_CONFIG.pieConfig.minPercentForLabel) return null;

    const radian = Math.PI / 180;
    const x = cx + CHART_CONFIG.pieConfig.labelRadius * Math.cos(-midAngle * radian);
    const y = cy + CHART_CONFIG.pieConfig.labelRadius * Math.sin(-midAngle * radian);
  
    return (
      <text
        x={x}
        y={y}
        fill="hsl(var(--background))"
        textAnchor={x > cx ? 'start' : 'end'}
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
                cx={CHART_CONFIG.pieConfig.cx}
                cy={CHART_CONFIG.pieConfig.cy}
                labelLine={false}
                label={renderLabel}
                outerRadius={CHART_CONFIG.pieConfig.outerRadius}
                dataKey="value"
                paddingAngle={2}
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
                contentStyle={CHART_CONFIG.styles.tooltip}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                formatter={(_, entry: any, index: number) => (
                  <span 
                    className="text-[11px] md:text-xs"
                    style={{ 
                      ...CHART_CONFIG.styles.legend,
                      color: COLORS[index % COLORS.length]
                    }}
                  >
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