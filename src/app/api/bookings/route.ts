import { NextResponse, type NextRequest } from 'next/server';

import { stackServerApp } from '@/lib/auth';
import { logger } from '@/lib/utils/logger';
import { getFootballFieldBookings, createFootballFieldBooking } from '@/lib/db/services/bookings';

export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookings = await getFootballFieldBookings();
    return NextResponse.json(bookings);
  } catch (error) {
    logger.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingData = await request.json();
    const booking = await createFootballFieldBooking({
      ...bookingData,
      createdBy: user.id,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    logger.error('Error creating booking:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create booking' }, 
      { status: 500 }
    );
  }
}
