"use client";

import { TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SaleWithDetails } from "@/types/sales";

interface RevenueChartProps {
  sales: SaleWithDetails[];
}

export default function RevenueChart({ sales }: RevenueChartProps) {
  // Group sales by date and calculate daily revenue
  const chartData = sales.reduce((acc, sale) => {
    const date = new Date(sale.createdAt).toLocaleDateString();
    const revenue = parseFloat(sale.totalPrice) || 0;
    
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += revenue;
    
    return acc;
  }, {} as Record<string, number>);

  // Convert to array format for chart
  const data = Object.entries(chartData).map(([date, revenue]) => ({
    date,
    revenue
  }));
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
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `${value}€`} />
              <Tooltip formatter={(value: number) => `${value.toFixed(2)}€`} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}