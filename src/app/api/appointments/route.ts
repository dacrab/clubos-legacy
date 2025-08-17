import { NextResponse, type NextRequest } from 'next/server';

import { stackServerApp } from '@/lib/auth';
import { logger } from '@/lib/utils/logger';
import { getAppointments, createAppointment } from '@/lib/db/services/appointments';

export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointments = await getAppointments();
    return NextResponse.json(appointments);
  } catch (error) {
    logger.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appointmentData = await request.json();
    const appointment = await createAppointment({
      ...appointmentData,
      createdBy: user.id,
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    logger.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create appointment' }, 
      { status: 500 }
    );
  }
}
