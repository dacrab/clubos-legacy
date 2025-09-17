'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, History } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import {
  type OrderItemWithProduct,
  type OrderWithItems,
  useRegisterSessions,
} from '@/hooks/use-register-sessions';
import { computeOrderTotalsFromItems } from '@/lib/utils/sales-totals';
import type { OrderItem } from '@/types/database';
import EditableSaleCard from './editable-sale-card';

// Constants
const SHORT_ID_LENGTH = 8;
const MAX_ORDERS_DISPLAY = 10;

// Types
type RecentSalesContentProps = {
  orders: OrderWithItems[];
  onUpdate: (orderItem: OrderItem) => void;
  expandedOrders: string[];
  onToggleOrder: (id: string) => void;
};

type OrderCardHeaderProps = {
  order: OrderWithItems;
  expanded: boolean;
  onToggle: () => void;
};

function OrderCardHeader({ order, expanded, onToggle }: OrderCardHeaderProps) {
  const treatsCount = order.order_items.reduce((n, i) => n + (i.is_treat ? i.quantity : 0), 0);
  const coupons = (order as { card_discounts_applied?: number }).card_discounts_applied || 0;
  const { grossSubtotal, finalAmount } = computeOrderTotalsFromItems(
    order.order_items.map((i) => ({
      is_treat: i.is_treat,
      total_price: i.line_total,
      is_deleted: i.is_deleted,
    })),
    coupons
  );

  const handleClick = () => {
    onToggle();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      aria-expanded={expanded}
      aria-label={`Επέκταση παραγγελίας ${order.id.slice(0, SHORT_ID_LENGTH)}`}
      className="group/item flex w-full items-start justify-between p-4 transition-colors hover:bg-muted/50"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      type="button"
    >
      <div className="space-y-1 text-left">
        <p className="font-medium text-sm">Παραγγελία #{order.id.slice(0, SHORT_ID_LENGTH)}</p>
        <p className="text-muted-foreground text-sm">
          {new Date(order.created_at).toLocaleString('el-GR')}
        </p>
        <div className="flex items-center gap-2">
          {order.order_items.length > 1 && (
            <span className="text-xs">({order.order_items.length} προϊόντα)</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Treats indicator */}
          {treatsCount > 0 && (
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-amber-600 text-xs">
              {treatsCount}x
            </span>
          )}
          {/* Coupons indicator */}
          {coupons > 0 && (
            <span className="rounded bg-primary/10 px-2 py-0.5 text-primary text-xs">
              {coupons}x
            </span>
          )}
          {/* Show both subtotal and final */}
          <span className="text-muted-foreground text-xs tabular-nums line-through">
            {grossSubtotal.toFixed(2)}€
          </span>
          <span className="font-medium tabular-nums">{finalAmount.toFixed(2)}€</span>
        </div>
        <div
          className={`transform transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </button>
  );
}

type OrderCardProps = {
  order: OrderWithItems;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (orderItem: OrderItem) => void;
};

function OrderCard({ order, expanded, onToggle, onUpdate }: OrderCardProps) {
  return (
    <div className="relative rounded-lg border bg-card text-card-foreground transition-all hover:shadow-sm">
      <OrderCardHeader expanded={expanded} onToggle={onToggle} order={order} />
      <AnimatePresence>
        {expanded && (
          <motion.div
            animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden"
            exit={{ height: 0, opacity: 0 }}
            initial={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-2 p-4 pt-0">
              {order.order_items.map((orderItem: OrderItemWithProduct) => (
                <EditableSaleCard key={orderItem.id} onUpdate={onUpdate} orderItem={orderItem} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RecentSalesContent({
  orders,
  expandedOrders,
  onToggleOrder,
  onUpdate,
}: RecentSalesContentProps) {
  if (orders.length === 0) {
    return (
      <EmptyState
        description="Δεν υπάρχουν πρόσφατες πωλήσεις για εμφάνιση."
        icon={History}
        title="Δεν βρέθηκαν πωλήσεις"
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderCard
          expanded={expandedOrders.includes(order.id)}
          key={order.id}
          onToggle={() => onToggleOrder(order.id)}
          onUpdate={onUpdate}
          order={order}
        />
      ))}
    </div>
  );
}

export default function RecentSales() {
  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);
  const { sessions, isLoading, mutate } = useRegisterSessions();
  // Removed useSaleActions - not needed in this component

  const orders = useMemo(() => {
    if (!sessions) {
      return [];
    }
    return sessions
      .flatMap((session) => session.orders)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, MAX_ORDERS_DISPLAY);
  }, [sessions]);

  const handleToggleOrder = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleUpdateSale = (_orderItem: OrderItem) => {
    // Placeholder for update logic
    mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Πρόσφατες Πωλήσεις</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSkeleton className="h-8 w-full rounded-md" count={1} />
          </div>
        ) : (
          <RecentSalesContent
            expandedOrders={expandedOrders}
            onToggleOrder={handleToggleOrder}
            onUpdate={handleUpdateSale}
            orders={orders}
          />
        )}
      </CardContent>
    </Card>
  );
}
