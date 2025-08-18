import { desc, eq } from 'drizzle-orm';

import type { NewSale, OrderItem, SaleWithDetails } from '@/types/sales';
import { db } from '@/lib/db';
import { orders, products, sales } from '@/lib/db/schema';
import { logger } from '@/lib/utils/logger';

export async function getRecentOrders(limit: number = 5) {
  const result = await db.query.orders.findMany({
    with: {
      createdBy: true,
      sales: {
        with: {
          product: true,
        },
      },
    },
    orderBy: [desc(orders.createdAt)],
    limit,
  });
  return result;
}

export async function createSaleWithOrder(newSale: NewSale, userId: string, sessionId: string) {
  return await db.transaction(async tx => {
    // Create the order
    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber: `ORD-${Date.now()}`,
        registerSessionId: sessionId,
        totalAmount: newSale.totalAmount.toString(),
        finalAmount: newSale.finalAmount.toString(),
        cardDiscountCount: newSale.cardDiscountCount,
        createdBy: userId,
      })
      .returning();

    // Create the sales items
    const saleItems = newSale.items.map((item: OrderItem) => ({
      orderId: order.id,
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.price.toString(),
      totalPrice: (parseFloat(item.product.price) * item.quantity).toString(),
      isTreat: item.isTreat,
    }));

    await tx.insert(sales).values(saleItems);

    // Update stock for non-treat items
    for (const item of newSale.items) {
      if (item.product.stock !== -1 && !item.isTreat) {
        await tx
          .update(products)
          .set({ stock: item.product.stock - item.quantity })
          .where(eq(products.id, item.product.id));
      }
    }

    return order;
  });
}

export async function getSalesWithDetails() {
  const result = await db.query.sales.findMany({
    with: {
      order: {
        with: {
          createdBy: true,
        },
      },
      product: true,
    },
    orderBy: [desc(sales.createdAt)],
  });
  return result;
}

// Additional sales functions for API
export async function getSales(
  _filters: {
    startDate?: Date;
    endDate?: Date;
    category?: string;
    paymentMethod?: string;
  } = {}
) {
  try {
    // mark as intentionally unused for future filtering logic
    void _filters;
    const result = await getSalesWithDetails();
    return result;
  } catch (error) {
    logger.error('Error fetching sales:', error);
    throw new Error('Failed to fetch sales');
  }
}

export async function getSaleById(id: string) {
  try {
    const result = await db.query.sales.findFirst({
      where: eq(sales.id, id),
      with: {
        order: {
          with: {
            createdBy: true,
          },
        },
        product: true,
      },
    });

    return result || null;
  } catch (error) {
    logger.error('Error fetching sale by id:', error);
    throw new Error('Failed to fetch sale');
  }
}

export async function createSale(saleData: NewSale & { createdBy: string; sessionId: string }) {
  try {
    return await createSaleWithOrder(saleData, saleData.createdBy, saleData.sessionId);
  } catch (error) {
    logger.error('Error creating sale:', error);
    throw new Error('Failed to create sale');
  }
}

export async function updateSale(id: string, updateData: Partial<SaleWithDetails>) {
  try {
    const [result] = await db
      .update(sales)
      .set({
        ...updateData,
      })
      .where(eq(sales.id, id))
      .returning();

    return result || null;
  } catch (error) {
    logger.error('Error updating sale:', error);
    throw new Error('Failed to update sale');
  }
}

export async function deleteSale(id: string): Promise<boolean> {
  try {
    const result = await db.delete(sales).where(eq(sales.id, id)).returning();

    return result.length > 0;
  } catch (error) {
    logger.error('Error deleting sale:', error);
    throw new Error('Failed to delete sale');
  }
}
