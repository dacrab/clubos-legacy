import type { CookieOptions } from '@supabase/ssr';
import { createBrowserClient, createServerClient } from '@supabase/ssr';

import type { Database } from '@/types/supabase';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validation
if (!(supabaseUrl && supabaseAnonKey)) {
  throw new Error('Missing Supabase URL or anonymous key');
}

// Constants
const DEFAULT_IMAGE_QUALITY = 75;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Retry wrapper for Supabase operations
 */
async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await fn();
  } catch (error: unknown) {
    if (
      retries > 0 &&
      error instanceof Object &&
      'message' in error &&
      typeof error.message === 'string' &&
      (error.message.includes('rate limit') || error.message.includes('timeout'))
    ) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

/**
 * Creates a Supabase client for browser usage
 */
export function createClientSupabase() {
  if (!(supabaseUrl && supabaseAnonKey)) {
    throw new Error('Missing Supabase environment variables');
  }
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Creates a Supabase client for server components
 */
export async function createServerSupabase() {
  if (!(supabaseUrl && supabaseAnonKey)) {
    throw new Error('Missing Supabase environment variables');
  }
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value ?? '';
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set(name, value, {
            path: '/',
            ...options,
          });
        } catch {
          // Cookie cannot be set - this will be handled by Supabase
        }
      },
      remove(name: string, _options: CookieOptions) {
        try {
          cookieStore.delete(name);
        } catch {
          // Cookie cannot be deleted - this will be handled by Supabase
        }
      },
    },
  });
}

/**
 * Creates a Supabase client for API routes with retry logic
 */
export async function createAPISupabase() {
  if (!(supabaseUrl && supabaseAnonKey)) {
    throw new Error('Missing Supabase environment variables');
  }
  const { cookies } = await import('next/headers');
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value ?? '';
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set(name, value, {
            path: '/',
            ...options,
          });
        } catch {
          // Cookie cannot be set - this will be handled by Supabase
        }
      },
      remove(name: string, _options: CookieOptions) {
        try {
          cookieStore.delete(name);
        } catch {
          // Cookie cannot be deleted - this will be handled by Supabase
        }
      },
    },
  });

  const {
    data: { user },
    error,
  } = await withRetry(() => supabase.auth.getUser());

  if (error) {
    throw error;
  }
  if (!user) {
    throw new Error('Unauthorized');
  }

  return supabase;
}

/**
 * Creates a Supabase admin client with service role key
 */
export function createAdminClient() {
  if (!(serviceRoleKey && supabaseUrl)) {
    throw new Error('Missing Supabase environment variables');
  }

  return createBrowserClient<Database>(supabaseUrl, serviceRoleKey, {
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
 * Supabase Image Loader for Next.js
 */
export function supabaseImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  return `${supabaseUrl}/storage/v1/object/public/${src}?width=${width}&quality=${quality || DEFAULT_IMAGE_QUALITY}`;
}

// Default export for Next.js image loader
export default supabaseImageLoader;
