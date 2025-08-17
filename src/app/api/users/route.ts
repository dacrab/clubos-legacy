import { NextResponse } from 'next/server';

import { stackServerApp } from '@/lib/auth';
import { createUser, getUsers } from '@/lib/db/services/users';

export async function POST(request: Request) {
  try {
    // Check if user is authenticated and is admin
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username, password, role = 'employee', email } = await request.json();

    if (!username || !password || !email) {
      return NextResponse.json({ error: 'Username, email and password required' }, { status: 400 });
    }

    // Create user with Stack Auth
    const newStackUser = await stackServerApp.createUser({
      primaryEmail: email,
      displayName: username,
      password,
    });

    // Create user record in our database
    const newUser = await createUser({
      id: newStackUser.id,
      email,
      username,
      role: role as 'admin' | 'employee' | 'secretary',
    });

    return NextResponse.json(newUser);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    const status = message.includes('already exists') ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET() {
  try {
    // Check if user is authenticated
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await getUsers();
    return NextResponse.json({ users });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
