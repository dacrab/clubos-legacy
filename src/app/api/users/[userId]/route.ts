import { NextResponse, type NextRequest } from 'next/server';

import { checkAdminAccess } from '@/lib/api-utils';
import { stackServerApp } from '@/lib/auth';
import { ALLOWED_USER_ROLES, PASSWORD_MIN_LENGTH } from '@/lib/constants';
import { deleteUser, getUserById, updateUser } from '@/lib/db/services/users';

function getUserId(request: NextRequest): string | null {
  return request.nextUrl.pathname.split('/').pop() || null;
}

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await stackServerApp.getUser();

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    const userId = getUserId(request);
    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    const userData = await getUserById(userId);
    if (!userData) {
      return errorResponse('User not found', 404);
    }

    return NextResponse.json(userData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return errorResponse(message, 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication and admin access
    const user = await stackServerApp.getUser();

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    // Check if user is admin
    const currentUser = await getUserById(user.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return errorResponse('Admin access required', 403);
    }

    const userId = getUserId(request);
    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    await deleteUser(userId);

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return errorResponse(message, 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication and admin access
    const user = await stackServerApp.getUser();

    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    // Check if user is admin
    const currentUser = await getUserById(user.id);
    if (!currentUser || currentUser.role !== 'admin') {
      return errorResponse('Admin access required', 403);
    }

    const userId = getUserId(request);
    if (!userId) {
      return errorResponse('User ID is required', 400);
    }
    const { role } = await request.json();
    if (!role || !ALLOWED_USER_ROLES.includes(role)) {
      return errorResponse('Invalid role specified', 400);
    }

    const updatedUser = await updateUser(userId, { role });

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return errorResponse(message, 500);
  }
}
export async function POST(request: NextRequest) {
  try {
    const adminAccess = await checkAdminAccess();
    if (!adminAccess) {
      return errorResponse('Admin access required', 403);
    }

    const userId = getUserId(request);
    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    const { password } = await request.json();
    if (!password || password.length < PASSWORD_MIN_LENGTH) {
      return errorResponse('Password does not meet minimum length requirement', 400);
    }

    // Implement password reset with Stack Auth
    const stackUser = await stackServerApp.getUser(userId);
    if (!stackUser) {
      return errorResponse('User not found in Stack Auth', 404);
    }

    // Update password using Stack Auth
    await stackUser.update({ password });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return errorResponse(message, 500);
  }
}
