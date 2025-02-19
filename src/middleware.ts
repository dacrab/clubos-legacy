import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow access to root path, auth endpoints and static files
  if (
    path === "/" ||
    path.startsWith('/api/auth/') ||
    path.startsWith('/_next/') ||
    path.startsWith('/api/') ||
    path.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // Handle unauthenticated users
    if (!user || userError) {
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("from", path);
      return NextResponse.redirect(redirectUrl);
    }

    // Get user role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      // If no profile exists, sign out the user and redirect to login
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check dashboard access permissions
    if (path.startsWith('/dashboard/')) {
      const rolePath = path.split('/')[2]; // Get role from path
      if (rolePath && rolePath !== profile.role && profile.role !== 'admin') {
        return NextResponse.redirect(
          new URL(`/dashboard/${profile.role}`, request.url)
        );
      }
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, redirect to login
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("from", path);
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};