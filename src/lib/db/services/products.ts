import { eq, lte, ne } from 'drizzle-orm';

import { db } from '@/lib/db';
import { products, sales } from '@/lib/db/schema';
import { logger } from '@/lib/utils/logger';

export async function getProducts() {
  const result = await db.query.products.findMany({
    with: {
      category: true,
    },
    orderBy: [products.name],
  });
  return result;
}

export async function getProductById(id: string) {
  const result = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      category: true,
    },
  });
  return result;
}

export async function getLowStockProducts() {
  const result = await db
    .select()
    .from(products)
    .where(lte(products.stock, 10) && ne(products.stock, -1));
  return result;
}

export async function createProduct(productData: typeof products.$inferInsert) {
  const [result] = await db.insert(products).values(productData).returning();
  return result;
}

export async function updateProduct(id: string, updates: Partial<typeof products.$inferInsert>) {
  const [result] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
  return result;
}

export async function updateProductStock(id: string, newStock: number) {
  const [result] = await db
    .update(products)
    .set({ stock: newStock })
    .where(eq(products.id, id))
    .returning();
  return result;
}

export async function deleteProduct(id: string) {
  const [result] = await db.delete(products).where(eq(products.id, id)).returning();
  return result;
}

export async function checkProductHasSales(id: string): Promise<boolean> {
  try {
    const result = await db
      .select({ count: sales.id })
      .from(sales)
      .where(eq(sales.productId, id))
      .limit(1);

    return result.length > 0;
  } catch (error) {
    logger.error('Error checking product sales:', error);
    throw new Error('Failed to check product sales');
  }
}
