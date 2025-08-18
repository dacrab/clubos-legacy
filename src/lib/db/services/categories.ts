import { eq } from 'drizzle-orm';

import type { Category, GroupedCategory } from '@/types/products';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';

export async function getCategories() {
  const result = await db.select().from(categories).orderBy(categories.name);
  return result;
}

export async function getCategoriesWithParent() {
  const result = await db.query.categories.findMany({
    with: {
      parent: true,
    },
    orderBy: [categories.name],
  });
  return result;
}

export async function getGroupedCategories(): Promise<GroupedCategory[]> {
  const allCategories = await getCategoriesWithParent();

  const mainCategories = allCategories.filter(cat => !cat.parentId);
  const subCategoriesMap = allCategories.reduce((acc: Record<string, Category[]>, cat) => {
    if (cat.parentId) {
      acc[cat.parentId] = [...(acc[cat.parentId] || []), cat as Category];
    }
    return acc;
  }, {});

  return mainCategories.map(main => ({
    main: main as Category,
    subcategories: subCategoriesMap[main.id] || [],
  }));
}

export async function createCategory(categoryData: {
  name: string;
  description?: string;
  parentId?: string;
  createdBy: string;
}) {
  const [result] = await db.insert(categories).values(categoryData).returning();
  return result;
}

export async function updateCategory(id: string, updates: Partial<typeof categories.$inferInsert>) {
  const [result] = await db
    .update(categories)
    .set(updates)
    .where(eq(categories.id, id))
    .returning();
  return result;
}

export async function deleteCategory(id: string) {
  const [result] = await db.delete(categories).where(eq(categories.id, id)).returning();
  return result;
}
