import { BarChart2, CreditCard, Gift } from 'lucide-react';
import type { ElementType } from 'react';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateSalesStats, type SaleLike } from '@/lib/utils/chart-utils';
import { cn, formatPrice } from '@/lib/utils/format';

type StatsCardsProps = {
  sales: SaleLike[];
};

type StatDetail = {
  label: string;
  value?: string;
  className?: string;
  valueClassName?: string;
};

type CardData = {
  title: string;
  icon: ElementType;
  iconClassName?: string;
  value: string;
  details: StatDetail[];
};

const TEXT_AMBER_500 = 'text-amber-500';

export default function StatsCards({ sales }: StatsCardsProps) {
  const stats = useMemo(() => calculateSalesStats(sales), [sales]);

  const cards: CardData[] = [
    {
      title: 'Συνολικά Έσοδα',
      icon: BarChart2,
      value: formatPrice(stats.totalRevenue),
      details: [
        { label: 'Υποσύνολο', value: formatPrice(stats.totalBeforeDiscounts) },
        ...(stats.cardDiscountCount > 0
          ? [
              {
                label: `Κουπόνια (${stats.cardDiscountCount}x)`,
                value: `-${formatPrice(stats.cardDiscountAmount)}`,
                className: 'text-primary',
              },
            ]
          : []),
        ...(stats.treatCount > 0
          ? [
              {
                label: `Κεράσματα (${stats.treatCount}x)`,
                value: `(${formatPrice(stats.treatsAmount)})`,
                className: TEXT_AMBER_500,
              },
            ]
          : []),
        {
          label: 'Σύνολο',
          value: formatPrice(stats.totalRevenue),
          className: 'font-medium pt-1 border-t mt-1',
        },
      ],
    },
    {
      title: 'Μέση Αξία Παραγγελίας',
      icon: CreditCard,
      value: formatPrice(stats.averageOrderValue),
      details: [
        { label: `Συνολικές πωλήσεις: ${stats.totalSales} τεμ.` },
        { label: `Μοναδικοί κωδικοί: ${stats.uniqueCodes}` },
      ],
    },
    {
      title: 'Κεράσματα',
      icon: Gift,
      iconClassName: TEXT_AMBER_500,
      value: `${stats.treatCount} τεμ.`,
      details:
        stats.treatsAmount > 0
          ? [
              {
                label: 'Αξία',
                value: formatPrice(stats.treatsAmount),
                valueClassName: TEXT_AMBER_500,
              },
            ]
          : [],
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.iconClassName || 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{card.value}</div>
            {card.details.length > 0 && (
              <div className="mt-2 space-y-0.5 text-muted-foreground text-xs">
                {card.details.map((detail, _detailIndex) =>
                  'value' in detail ? (
                    <div
                      className={cn('flex justify-between', detail.className)}
                      key={detail.label}
                    >
                      <span>{detail.label}:</span>
                      <span className={detail.valueClassName || ''}>{detail.value}</span>
                    </div>
                  ) : (
                    <p key={detail.label}>{detail.label}</p>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
