import { useMemo } from 'react';
import { CreditCard, Gift, TrendingUp, Wallet } from 'lucide-react';

import type { SaleWithDetails } from '@/types/sales';
import { formatPrice } from '@/lib/utils';
import { calculateSalesStats } from '@/lib/utils/chart-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardsProps {
  sales: SaleWithDetails[];
}

export default function StatsCards({ sales }: StatsCardsProps) {
  const stats = useMemo(() => calculateSalesStats(sales), [sales]);

  const cardData = [
    {
      title: 'Σύνολο Πωλήσεων',
      value: formatPrice(stats.totalRevenue),
      icon: TrendingUp,
      change: `${stats.totalSales} τεμ.`,
      description: `Πριν τις εκπτώσεις: ${formatPrice(stats.totalBeforeDiscounts)}`,
    },
    {
      title: 'Πωλήσεις με Μετρητά',
      value: formatPrice(stats.cashRevenue),
      icon: Wallet,
      change: `${stats.cashSalesCount} τεμ.`,
    },
    {
      title: 'Πωλήσεις με Κουπόνια',
      value: formatPrice(stats.cardRevenue),
      icon: CreditCard,
      change: `${stats.cardSalesCount} τεμ.`,
      description: `Εφαρμόστηκαν ${stats.cardDiscountCount} κουπόνια (${formatPrice(stats.cardDiscountAmount)} έκπτωση)`,
    },
    {
      title: 'Κεράσματα',
      value: formatPrice(stats.treatsAmount),
      icon: Gift,
      change: `${stats.treatCount} τεμ.`,
      description: `Ισοδυναμεί με ${formatPrice(stats.treatsAmount)} σε αξία`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cardData.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-muted-foreground text-xs">{card.change}</p>
            {card.description && (
              <p className="text-muted-foreground mt-1 text-xs">{card.description}</p>
            )}
            {card.title === 'Σύνολο Πωλήσεων' && (
              <p className="text-muted-foreground text-xs">
                Μοναδικά προϊόντα: {stats.uniqueProducts}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
