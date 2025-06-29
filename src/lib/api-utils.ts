import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { API_ERROR_MESSAGES } from './constants';
import { Database } from '@/types/supabase';
import { createServerSupabase } from './supabase/server';

/**
 * Checks if current user is admin and returns user info
 * @returns Object containing currentUser and user if admin, or null if not
 */
export async function checkAdminAccess() {
  const supabase = await createServerSupabase();
  
  // Check if user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return null;
  }

  // Check if user has admin role
  const { data: currentUser, error: currentUserError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (currentUserError || !currentUser || currentUser.role !== 'admin') {
    return null;
  }

  return { currentUser, user };
}

/**
 * Standard API error response helper
 */
export function errorResponse(message: string, status: number = 500, details?: any) {
  console.error(`API Error: ${message}`, details || '');
  return NextResponse.json(
    { error: message, ...(details ? { details } : {}) },
    { status }
  );
}

/**
 * Standard API success response helper
 */
export function successResponse(data: any, message?: string) {
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
  console.error('Critical API error:', error);
  return errorResponse(
    API_ERROR_MESSAGES.SERVER_ERROR,
    500,
    error instanceof Error ? { message: error.message } : undefined
  );
} 