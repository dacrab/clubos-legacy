import { memo } from 'react';
import { ChevronDown, ChevronUp, CreditCard, Euro, Gift } from 'lucide-react';

import type { ListItem, Order } from '@/types/register';
import { CARD_DISCOUNT } from '@/lib/constants';
import { cn, formatDateWithGreekAmPm, formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

import { ClosingDetails } from './ClosingDetails';

interface RegisterItemCardProps {
  item: ListItem;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

function RegisterItemCard({ item, isExpanded, onToggle }: RegisterItemCardProps) {
  const isActive = item.type === 'active';
  const id = isActive ? item.id : item.session.id;
  const date = new Date(isActive ? item.opened_at : item.created_at);

  // Calculate totals with proper types
  const orders: Order[] = item.orders || [];
  let totalAmount = 0;
  let cardDiscounts = 0;
  let treats = 0;
  let treatsAmount = 0;

  orders.forEach(order => {
    // Properly typed order calculations
    totalAmount += parseFloat(order.finalAmount?.toString() || '0');
    cardDiscounts += order.cardDiscountCount || 0;

    // Calculate treats from sales data
    if (order.sales) {
      order.sales.forEach(sale => {
        if (sale.isTreat) {
          treats += sale.quantity;
          treatsAmount += parseFloat(sale.totalPrice?.toString() || '0');
        }
      });
    }
  });

  const discountAmount = cardDiscounts * CARD_DISCOUNT;
  const finalAmount = Math.max(0, totalAmount - discountAmount);
  return (
    <Card
      className={cn(
        'w-full p-4 transition-colors',
        isActive && 'border-primary/20',
        isExpanded && 'bg-muted/50'
      )}
    >
      <div
        role="button"
        tabIndex={0}
        className="flex cursor-pointer items-center justify-between"
        onClick={() => onToggle(id)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle(id);
          }
        }}
      >
        <div className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <Badge
              variant={isActive ? 'outline' : 'secondary'}
              className={isActive ? 'border-primary text-primary' : ''}
            >
              {isActive ? 'Ενεργό Ταμείο' : `Έκλεισε από: ${item.closed_by_name}`}
            </Badge>
            <span className="text-muted-foreground text-sm">{formatDateWithGreekAmPm(date)}</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
                <Euro className="h-3 w-3 text-green-500" />
                Τελικό Ποσό
              </div>
              <span className="font-semibold">{formatPrice(finalAmount)}</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
                <CreditCard className="h-3 w-3 text-blue-500" />
                Κουπόνια
              </div>
              <span className="font-semibold">{cardDiscounts}x</span>
              {cardDiscounts > 0 && (
                <span className="text-xs text-red-500">-{formatPrice(discountAmount)}</span>
              )}
            </div>

            <div className="flex flex-col items-center">
              <div className="text-muted-foreground mb-1 flex items-center gap-1 text-xs">
                <Gift className="h-3 w-3 text-amber-500" />
                Κεράσματα
              </div>
              <span className="font-semibold">{treats}x</span>
              {treats > 0 && (
                <span className="text-xs text-amber-500">{formatPrice(treatsAmount)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="ml-4">
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>

      {isExpanded && (
        <ClosingDetails
          session={isActive ? item : item.session}
          closing={isActive ? null : item}
          orders={orders}
        />
      )}
    </Card>
  );
}

export default memo(RegisterItemCard);
