import { desc, eq } from 'drizzle-orm';

import type { FootballFieldBooking, FootballFieldBookingInsert } from '@/types/bookings';
import { logger } from '@/lib/utils/logger';

import { db } from '../index';
import { footballFieldBookings } from '../schema';

export async function getFootballFieldBookings(): Promise<FootballFieldBooking[]> {
  try {
    const result = await db
      .select()
      .from(footballFieldBookings)
      .orderBy(desc(footballFieldBookings.bookingDatetime));

    return result as FootballFieldBooking[];
  } catch (error) {
    logger.error('Error fetching bookings:', error);
    throw new Error('Failed to fetch bookings');
  }
}

export async function getFootballFieldBookingById(
  id: string
): Promise<FootballFieldBooking | null> {
  try {
    const result = await db
      .select()
      .from(footballFieldBookings)
      .where(eq(footballFieldBookings.id, id))
      .limit(1);

    return (result[0] as FootballFieldBooking) || null;
  } catch (error) {
    logger.error('Error fetching booking by id:', error);
    throw new Error('Failed to fetch booking');
  }
}

export async function createFootballFieldBooking(
  bookingData: FootballFieldBookingInsert
): Promise<FootballFieldBooking> {
  try {
    const newBooking = {
      ...bookingData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insert(footballFieldBookings).values(newBooking).returning();

    return result[0] as FootballFieldBooking;
  } catch (error) {
    logger.error('Error creating booking:', error);
    throw new Error('Failed to create booking');
  }
}

export async function updateFootballFieldBooking(
  id: string,
  updateData: Partial<FootballFieldBookingInsert>
): Promise<FootballFieldBooking | null> {
  try {
    const result = await db
      .update(footballFieldBookings)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(footballFieldBookings.id, id))
      .returning();

    return (result[0] as FootballFieldBooking) || null;
  } catch (error) {
    logger.error('Error updating booking:', error);
    throw new Error('Failed to update booking');
  }
}

export async function deleteFootballFieldBooking(id: string): Promise<boolean> {
  try {
    const result = await db
      .delete(footballFieldBookings)
      .where(eq(footballFieldBookings.id, id))
      .returning();

    return result.length > 0;
  } catch (error) {
    logger.error('Error deleting booking:', error);
    throw new Error('Failed to delete booking');
  }
}
