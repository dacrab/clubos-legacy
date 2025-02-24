import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { cookies } from 'next/headers';

// Types
type SessionData = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

type SessionAction = 'set' | 'remove';

// Session Management
export async function handleSession(action: SessionAction, sessionData?: SessionData) {
  const cookieStore = await cookies();

  if (action === 'set' && sessionData) {
    cookieStore.set('session', JSON.stringify(sessionData), { path: '/', httpOnly: true });
  } else if (action === 'remove') {
    cookieStore.delete('session');
  }
}

// Supabase Client Creation
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            return cookieStore.get(name)?.value;
          } catch {
            return undefined;
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Handle error silently in non-Server Action context
          }
        },
        remove(name: string) {
          try {
            cookieStore.delete(name);
          } catch {
            // Handle error silently in non-Server Action context
          }
        },
      },
    }
  );
}