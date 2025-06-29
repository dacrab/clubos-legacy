import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import { API_ERROR_MESSAGES } from "@/lib/constants";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error?.message?.includes('rate limit') || error?.message?.includes('timeout'))) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

// For server components
export async function createServerSupabase(requireAuth: boolean = false) {
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
          } catch (error) {
            // Cookie cannot be set - this will be handled by Supabase
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete(name);
          } catch (error) {
            // Cookie cannot be deleted - this will be handled by Supabase
          }
        },
      },
    }
  );

  return supabase;
}

// For API routes
export async function createAPISupabase() {
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
          } catch (error) {
            // Cookie cannot be set - this will be handled by Supabase
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.delete(name);
          } catch (error) {
            // Cookie cannot be deleted - this will be handled by Supabase
          }
        },
      },
    }
  );

  try {
    const { data: { user }, error } = await withRetry(() => supabase.auth.getUser());
    if (error) {
      throw error;
    }
    if (!user) {
      throw new Error(API_ERROR_MESSAGES.UNAUTHORIZED);
    }
    return supabase;
  } catch (error) {
    console.error('API Supabase error:', error);
    throw error;
  }
} 