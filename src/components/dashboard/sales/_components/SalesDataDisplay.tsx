import type { SaleWithDetails } from '@/types/sales';
import { formatDateWithGreekAmPm, formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SalesDataDisplayProps {
  sales: SaleWithDetails[];
  title: string;
}

export default function SalesDataDisplay({ sales, title }: SalesDataDisplayProps) {
  if (sales.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-8 text-center">
            Δεν υπάρχουν πωλήσεις για εμφάνιση
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="secondary">{sales.length} πωλήσεις</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sales.slice(0, 10).map(sale => (
          <div
            key={sale.id}
            className="bg-muted/30 flex items-center justify-between rounded-lg p-3"
          >
            <div className="flex-1">
              <h4 className="font-medium">{sale.productName}</h4>
              <p className="text-muted-foreground text-sm">
                {formatDateWithGreekAmPm(new Date(sale.createdAt))}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">{formatPrice(parseFloat(sale.totalPrice))}</p>
              <p className="text-muted-foreground text-sm">{sale.quantity} τεμ.</p>
            </div>
          </div>
        ))}
        {sales.length > 10 && (
          <p className="text-muted-foreground text-center text-sm">
            και {sales.length - 10} ακόμη πωλήσεις...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
