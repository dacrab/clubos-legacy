import { NextResponse } from 'next/server';

import { stackServerApp } from './auth';
import { API_ERROR_MESSAGES } from './constants';
import { getUserById } from './db/services/users';
import { logger } from './utils/logger';

/**
 * Checks if current user is admin and returns user info
 * @returns Object containing currentUser and user if admin, or null if not
 */
export async function checkAdminAccess() {
  // Check if user is authenticated
  const user = await stackServerApp.getUser();
  if (!user) {
    return null;
  }

  // Check if user has admin role
  const currentUser = await getUserById(user.id);
  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }

  return { currentUser, user };
}

/**
 * Standard API error response helper
 */
export function errorResponse(message: string, status: number = 500, details?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    logger.error(`API Error: ${message}`, details || '');
  }
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}) },
    { status }
  );
}

/**
 * Standard API success response helper
 */
export function successResponse<T>(data: T, message?: string) {
  return NextResponse.json({
    success: true,
    ...(message ? { message } : {}),
    ...(data ? { data } : {})
  });
}

/**
 * Catch-all error handler for API routes
 */
export function handleApiError(error: unknown) {
  if (process.env.NODE_ENV === 'development') {
    logger.error('Critical API error:', error);
  }
  return errorResponse(
    API_ERROR_MESSAGES.SERVER_ERROR,
    500,
    error instanceof Error ? { message: error.message } : undefined
  );
} 