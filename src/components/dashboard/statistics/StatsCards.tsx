import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, BarChart2, Gift } from "lucide-react";
import type { Sale } from "@/types/sales";
import { calculateSalesStats } from "@/lib/utils/chart-utils";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ElementType } from "react";

interface StatsCardsProps {
  sales: Sale[];
}

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

export default function StatsCards({ sales }: StatsCardsProps) {
  const stats = useMemo(() => calculateSalesStats(sales), [sales]);

  const cards: CardData[] = [
    {
      title: "Συνολικά Έσοδα",
      icon: BarChart2,
      value: formatPrice(stats.totalRevenue),
      details: [
        { label: "Υποσύνολο", value: formatPrice(stats.totalBeforeDiscounts) },
        ...(stats.cardDiscountCount > 0 ? [{
          label: `Κουπόνια (${stats.cardDiscountCount}x)`,
          value: `-${formatPrice(stats.cardDiscountAmount)}`,
          className: "text-primary"
        }] : []),
        ...(stats.treatCount > 0 ? [{
          label: `Κεράσματα (${stats.treatCount}x)`,
          value: `(${formatPrice(stats.treatsAmount)})`,
          className: "text-amber-500"
        }] : []),
        {
          label: "Σύνολο",
          value: formatPrice(stats.totalRevenue),
          className: "font-medium pt-1 border-t mt-1"
        }
      ]
    },
    {
      title: "Μέση Αξία Παραγγελίας",
      icon: CreditCard,
      value: formatPrice(stats.averageOrderValue),
      details: [
        { label: `Συνολικές πωλήσεις: ${stats.totalSales} τεμ.` },
        { label: `Μοναδικοί κωδικοί: ${stats.uniqueCodes}` }
      ]
    },
    {
      title: "Κεράσματα",
      icon: Gift,
      iconClassName: "text-amber-500",
      value: `${stats.treatCount} τεμ.`,
      details: stats.treatsAmount > 0 ? [
        {
          label: "Αξία",
          value: formatPrice(stats.treatsAmount),
          valueClassName: "text-amber-500"
        }
      ] : []
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.iconClassName || "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.details.length > 0 && (
              <div className="text-xs text-muted-foreground space-y-0.5 mt-2">
                {card.details.map((detail, detailIndex) => (
                  'value' in detail ? (
                    <div key={detailIndex} className={cn("flex justify-between", detail.className)}>
                      <span>{detail.label}:</span>
                      <span className={detail.valueClassName || ''}>{detail.value}</span>
                    </div>
                  ) : (
                    <p key={detailIndex}>{detail.label}</p>
                  )
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}