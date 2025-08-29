import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { type Database } from '@/types/supabase';

import { API_ERROR_MESSAGES } from './constants';

/**
 * Creates a Supabase admin client with service role key
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

/**
 * Creates a Supabase client for API routes with cookies
 */
export async function createApiClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookies()).get(name)?.value ?? '';
        },
      },
    }
  );
}

/**
 * Checks if current user is admin and returns user info
 * @returns Object containing currentUser and user if admin, or null if not
 */
export async function checkAdminAccess() {
  const supabase = await createApiClient();
  
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

  if (currentUserError) {
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