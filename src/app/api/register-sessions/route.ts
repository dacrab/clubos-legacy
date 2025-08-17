import { NextResponse, type NextRequest } from 'next/server';

import { stackServerApp } from '@/lib/auth';
import { logger } from '@/lib/utils/logger';
import { getRegisterSessions, createRegisterSession } from '@/lib/db/services/register';

export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await getRegisterSessions();
    return NextResponse.json(sessions);
  } catch (error) {
    logger.error('Error fetching register sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch register sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionData = await request.json();
    const session = await createRegisterSession({
      ...sessionData,
      openedBy: user.id,
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    logger.error('Error creating register session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create register session' }, 
      { status: 500 }
    );
  }
}
