'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { OrderItemWithProduct } from '@/hooks/use-register-sessions';
import { CARD_DISCOUNT } from '@/lib/constants';
import { formatPrice } from '@/lib/utils/format';
import type { OrderWithItems, RegisterClosing, RegisterSession } from '@/types/database';
import type { OrderWithSales } from '@/types/register';

type ClosingDetailsProps = {
  session: RegisterSession;
  closing: RegisterClosing | null;
  orders?: (OrderWithItems | OrderWithSales)[];
};

type ProductSummary = {
  id: string;
  name: string;
  quantity: number;
  total: number;
  isTreat: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  originalCode?: string;
  originalQuantity?: number;
  treatQty?: number;
};

type TransactionTotals = {
  totalBeforeDiscounts: number;
  couponCount: number;
  couponAmount: number;
  finalTotal: number;
  treats: number;
  treatsAmount: number;
};

type Sale = {
  id: string;
  order_id: string;
  code_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  is_treat: boolean;
  payment_method: string;
  sold_by: string;
  created_at: string;
  is_deleted: boolean;
  is_edited: boolean;
  original_code: string | null;
  original_quantity: number | null;
  code?: {
    name: string;
    id?: string;
    category?: { name: string } | null;
  } | null;
};
type ExtendedSale = Sale;
type ExtendedOrderItem = OrderItemWithProduct;

const createSummaryItem = (id: string, name: string): ProductSummary => ({
  id,
  name,
  quantity: 0,
  total: 0,
  isTreat: false,
  isEdited: false,
  isDeleted: false,
  treatQty: 0,
});

const processOrderItem = (summary: Record<string, ProductSummary>, sale: ExtendedOrderItem) => {
  const id = sale.product.id || 'unknown';
  if (!summary[id]) {
    summary[id] = createSummaryItem(id, sale.product.name || 'Unknown');
  }

  const summaryItem = summary[id];
  if (sale.is_deleted) {
    summaryItem.isDeleted = true;
  } else {
    summaryItem.quantity += sale.quantity;
    summaryItem.total += sale.line_total;
    summaryItem.isTreat ||= sale.is_treat;
    if (sale.is_treat) {
      summaryItem.treatQty = (summaryItem.treatQty || 0) + sale.quantity;
    }
  }
};

const processSale = (summary: Record<string, ProductSummary>, sale: Sale | ExtendedOrderItem) => {
  if ('line_total' in sale) {
    processOrderItem(summary, sale);
    return;
  }

  // legacy sales path
  const extendedSale = sale as ExtendedSale;
  const id =
    extendedSale.original_code || extendedSale.code?.id || extendedSale.code_id || 'unknown';

  if (!summary[id]) {
    summary[id] = {
      id,
      name: extendedSale.original_code
        ? `${extendedSale.code?.name ?? 'Unknown'} (Changed)`
        : (extendedSale.code?.name ?? 'Unknown'),
      quantity: 0,
      total: 0,
      isTreat: false,
      isEdited: false,
      isDeleted: false,
      treatQty: 0,
    };
  }

  const summaryItem = summary[id];

  if (extendedSale.is_deleted) {
    summaryItem.isDeleted = true;
  } else {
    summaryItem.quantity += extendedSale.quantity;
    summaryItem.total += extendedSale.total_price;
    summaryItem.isTreat ||= extendedSale.is_treat;
    if (extendedSale.is_treat) {
      summaryItem.treatQty = (summaryItem.treatQty || 0) + extendedSale.quantity;
    }
  }

  summaryItem.isEdited ||= !!extendedSale.original_code;
  if (extendedSale.original_code) {
    summaryItem.originalCode = extendedSale.original_code;
  }
  if (extendedSale.original_quantity !== undefined && extendedSale.original_quantity !== null) {
    summaryItem.originalQuantity = extendedSale.original_quantity;
  }
};

const processSales = (orders: (OrderWithItems | OrderWithSales)[] = []) => {
  const summary: Record<string, ProductSummary> = {};
  for (const order of orders) {
    if ('order_items' in order && order.order_items) {
      for (const item of order.order_items) {
        processSale(summary, item);
      }
    } else if ('sales' in order && order.sales) {
      for (const sale of order.sales) {
        processSale(summary, sale);
      }
    }
  }
  return Object.values(summary);
};

const processOrderItems = (acc: TransactionTotals, order: OrderWithItems) => {
  for (const item of order.order_items) {
    if (!item.is_deleted) {
      acc.totalBeforeDiscounts += item.line_total;
      if (item.is_treat) {
        acc.treats += item.quantity;
        acc.treatsAmount += item.line_total;
      }
    }
  }
  acc.couponCount +=
    (order as unknown as { card_discounts_applied?: number }).card_discounts_applied || 0;
};

const processLegacySales = (acc: TransactionTotals, order: OrderWithSales) => {
  for (const sale of order.sales || []) {
    if (!(sale as ExtendedSale).is_deleted) {
      acc.totalBeforeDiscounts += sale.total_price;
      if (sale.is_treat) {
        acc.treats += sale.quantity;
        acc.treatsAmount += sale.total_price;
      }
    }
  }
  acc.couponCount +=
    (order as unknown as { card_discount_count?: number }).card_discount_count || 0;
};

const calculateTotals = (orders: (OrderWithItems | OrderWithSales)[] = []): TransactionTotals => {
  return orders.reduce(
    (acc, order) => {
      if ('order_items' in order && order.order_items) {
        processOrderItems(acc, order);
      } else if ('sales' in order && order.sales) {
        processLegacySales(acc, order);
      }
      return acc;
    },
    {
      totalBeforeDiscounts: 0,
      couponCount: 0,
      couponAmount: 0,
      finalTotal: 0,
      treats: 0,
      treatsAmount: 0,
    }
  );
};

export default function ClosingDetails({ session, closing, orders = [] }: ClosingDetailsProps) {
  const products = processSales(orders);
  const totals = calculateTotals(orders);
  totals.couponAmount = totals.couponCount * CARD_DISCOUNT;
  totals.finalTotal = Math.max(
    0,
    totals.totalBeforeDiscounts - totals.treatsAmount - totals.couponAmount
  );

  const sortedProducts = products.sort((a, b) => {
    if (a.isDeleted === b.isDeleted) {
      return 0;
    }
    return a.isDeleted ? 1 : -1;
  });

  return (
    <div>
      <h3 className="mb-4 font-semibold text-lg">Ανάλυση Πωλήσεων</h3>
      <ProductSummaryTable products={sortedProducts} />
      <TransactionSummaryTable totals={totals} />
      <NotesSection closing={closing} session={session} />
    </div>
  );
}

const ProductSummaryTable = ({ products }: { products: ProductSummary[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Προϊόν</TableHead>
        <TableHead className="text-right">Ποσότητα</TableHead>
        <TableHead className="text-right">Κεράσματα</TableHead>
        <TableHead className="text-right">Σύνολο</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {products.map((product) => (
        <TableRow key={product.id}>
          <TableCell>{product.name}</TableCell>
          <TableCell className="text-right">{product.quantity}</TableCell>
          <TableCell className="text-right">
            {product.treatQty ? `${product.treatQty}` : '—'}
          </TableCell>
          <TableCell className="text-right">{formatPrice(product.total)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const TransactionSummaryTable = ({ totals }: { totals: TransactionTotals }) => (
  <Table>
    <TableFooter>
      <TableRow>
        <TableCell colSpan={2}>Σύνολο πριν τις εκπτώσεις</TableCell>
        <TableCell className="text-right">{formatPrice(totals.totalBeforeDiscounts)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={2}>Κεράσματα</TableCell>
        <TableCell className="text-right">
          -{formatPrice(totals.treatsAmount)} ({totals.treats})
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={2}>Κουπόνια (x{totals.couponCount})</TableCell>
        <TableCell className="text-right">-{formatPrice(totals.couponAmount)}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={2}>Τελικό Σύνολο</TableCell>
        <TableCell className="text-right">{formatPrice(totals.finalTotal)}</TableCell>
      </TableRow>
    </TableFooter>
  </Table>
);

const NotesSection = ({
  session,
  closing,
}: {
  session: RegisterSession;
  closing: RegisterClosing | null;
}) => {
  const notes =
    (closing?.notes as { text?: string })?.text || (session.notes as { text?: string })?.text;
  if (!notes) {
    return null;
  }
  return (
    <div className="mt-4">
      <h4 className="font-semibold">Σημειώσεις</h4>
      <p className="text-muted-foreground text-sm">{notes}</p>
    </div>
  );
};
