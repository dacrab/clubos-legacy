import { NextResponse } from 'next/server';

import { logger } from '@/lib/utils/logger';

import { populateDatabase } from '../../../../scripts/seed';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { message: 'Database reset is not allowed in production' },
      { status: 403 }
    );
  }

  try {
    if (process.env.NODE_ENV === 'development') {
      logger.info('API endpoint /api/reset-db called');
    }
    // Call the seed function to reset and populate database
    await populateDatabase();
    return NextResponse.json({ message: 'Database reset successfully' });
  } catch (error) {
    logger.error('Error resetting database from API:', error);
    return NextResponse.json(
      { message: 'Failed to reset database', error: (error as Error).message },
      { status: 500 }
    );
  }
}
