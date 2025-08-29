import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from "next/server";

import { AUTH_PAGES } from '@/lib/constants';
import { type Database } from '@/types/supabase';

import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // Skip auth check for public routes
  if (AUTH_PAGES.includes(req.nextUrl.pathname as typeof AUTH_PAGES[number])) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: CookieOptions) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: CookieOptions) => {
          res.cookies.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  );

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*']
};