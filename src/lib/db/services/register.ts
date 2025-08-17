import { eq, isNull } from 'drizzle-orm';

import { db } from '@/lib/db';
import { registerSessions } from '@/lib/db/schema';

export async function getActiveRegisterSession() {
  const result = await db.query.registerSessions.findFirst({
    where: isNull(registerSessions.closedAt),
    with: {
      openedBy: true,
    },
  });
  return result;
}

export async function getAllRegisterSessions() {
  const result = await db.query.registerSessions.findMany({
    with: {
      openedBy: true,
      closedBy: true,
    },
    orderBy: [registerSessions.openedAt],
  });
  return result;
}

export async function createRegisterSession(sessionData: {
  sessionName?: string;
  openedBy: string;
  openingCash?: string;
}) {
  const [result] = await db.insert(registerSessions).values(sessionData).returning();
  return result;
}

export async function closeRegisterSession(
  sessionId: string,
  closedBy: string,
  closingData: {
    closingCash?: string;
    expectedCash?: string;
    cashDifference?: string;
    notes?: string;
  }
) {
  const [result] = await db.update(registerSessions)
    .set({
      closedAt: new Date(),
      closedBy,
      isActive: false,
      ...closingData,
    })
    .where(eq(registerSessions.id, sessionId))
    .returning();
  return result;
}

// Additional functions for API
export async function getRegisterSessions() {
  return await getAllRegisterSessions();
}
