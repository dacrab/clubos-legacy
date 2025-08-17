import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function getUsers() {
  const result = await db.select().from(users).orderBy(users.username);
  return result;
}

export async function getUserById(id: string) {
  const result = await db.query.users.findFirst({
    where: eq(users.id, id),
  });
  return result;
}

export async function getUserByEmail(email: string) {
  const result = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  return result;
}

export async function createUser(userData: typeof users.$inferInsert) {
  const [result] = await db.insert(users).values(userData).returning();
  return result;
}

export async function updateUser(id: string, updates: Partial<typeof users.$inferInsert>) {
  const [result] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
  return result;
}

export async function deleteUser(id: string) {
  const [result] = await db.delete(users).where(eq(users.id, id)).returning();
  return result;
}
