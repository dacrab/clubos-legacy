import { type CookieOptions, createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AUTH_PAGES } from '@/lib/constants';
import { env } from '@/lib/env';
import type { Database } from '@/types/supabase';

export async function middleware(req: NextRequest) {
  // Skip auth check for public routes
  if (AUTH_PAGES.includes(req.nextUrl.pathname as (typeof AUTH_PAGES)[number])) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!(supabaseUrl && supabaseAnonKey)) {
    // In middleware, you might want to log this error and redirect
    return NextResponse.redirect(new URL('/error', req.url));
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name: string) => req.cookies.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        res.cookies.set({ name, value, ...options });
      },
      remove: (name: string, options: CookieOptions) => {
        res.cookies.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return res;
  } catch (_error) {
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
