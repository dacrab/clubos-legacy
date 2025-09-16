import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { API_ERROR_MESSAGES } from '@/lib/constants';
import type { Database } from '@/types/supabase';

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Creates a Supabase admin client with service role key
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!(supabaseUrl && serviceRoleKey)) {
    throw new Error('Missing Supabase URL or service role key');
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  });
}

/**
 * Creates a Supabase client for API routes with cookies
 */
export function createApiClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!(supabaseUrl && supabaseAnonKey)) {
    throw new Error('Missing Supabase URL or anonymous key');
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      async get(name: string) {
        return (await cookies()).get(name)?.value ?? '';
      },
    },
    db: {
      schema: 'public',
    },
  });
}

/**
 * Checks if current user is admin and returns user info
 * @returns Object containing currentUser and user if admin, or null if not
 */
export async function checkAdminAccess() {
  const supabase = createApiClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
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
export function errorResponse(
  message: string,
  status = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details?: unknown
) {
  return NextResponse.json({ error: message, ...(details ? { details } : {}) }, { status });
}

/**
 * Standard API success response helper
 */
export function successResponse(data: unknown, message?: string) {
  return NextResponse.json({
    success: true,
    ...(message ? { message } : {}),
    ...(data ? { data } : {}),
  });
}

/**
 * Catch-all error handler for API routes
 */
export function handleApiError(error: unknown) {
  return errorResponse(
    API_ERROR_MESSAGES.SERVER_ERROR,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    error instanceof Error ? { message: error.message } : undefined
  );
}
