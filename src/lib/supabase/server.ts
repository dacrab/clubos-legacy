import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

export function createServerSupabase() {
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      async get(name: string) {
        return (await cookies()).get(name)?.value;
      },
      async set(name: string, value: string, options: CookieOptions) {
        (await cookies()).set({ name, value, ...options });
      },
      async remove(name: string, options: CookieOptions) {
        (await cookies()).set({ name, value: '', ...options });
      },
    },
  });
}
