import { desc, eq } from 'drizzle-orm';

import type { Appointment, AppointmentInsert } from '@/types/appointments';
import { logger } from '@/lib/utils/logger';

import { db } from '../index';
import { appointments } from '../schema';

export async function getAppointments(): Promise<Appointment[]> {
  try {
    const result = await db.select().from(appointments).orderBy(desc(appointments.dateTime));

    return result as Appointment[];
  } catch (error) {
    logger.error('Error fetching appointments:', error);
    throw new Error('Failed to fetch appointments');
  }
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  try {
    const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);

    return (result[0] as Appointment) || null;
  } catch (error) {
    logger.error('Error fetching appointment by id:', error);
    throw new Error('Failed to fetch appointment');
  }
}

export async function createAppointment(appointmentData: AppointmentInsert): Promise<Appointment> {
  try {
    const newAppointment = {
      ...appointmentData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.insert(appointments).values(newAppointment).returning();

    return result[0] as Appointment;
  } catch (error) {
    logger.error('Error creating appointment:', error);
    throw new Error('Failed to create appointment');
  }
}

export async function updateAppointment(
  id: string,
  updateData: Partial<AppointmentInsert>
): Promise<Appointment | null> {
  try {
    const result = await db
      .update(appointments)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id))
      .returning();

    return (result[0] as Appointment) || null;
  } catch (error) {
    logger.error('Error updating appointment:', error);
    throw new Error('Failed to update appointment');
  }
}

export async function deleteAppointment(id: string): Promise<boolean> {
  try {
    const result = await db.delete(appointments).where(eq(appointments.id, id)).returning();

    return result.length > 0;
  } catch (error) {
    logger.error('Error deleting appointment:', error);
    throw new Error('Failed to delete appointment');
  }
}
