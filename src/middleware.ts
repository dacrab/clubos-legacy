import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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

  const { data: { user }, error } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // Allow access to auth endpoints
  if (path.startsWith('/auth/')) {
    return response;
  }

  // Handle unauthenticated users
  if (!user || error) {
    if (path === "/") return response;
    
    const redirectUrl = new URL("/", request.url);
    redirectUrl.searchParams.set("from", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Get user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile) return response;

  // Redirect from root to role-specific dashboard
  if (path === "/") {
    return NextResponse.redirect(
      new URL(getDashboardPath(profile.role), request.url)
    );
  }

  // Check dashboard access permissions
  if (path.startsWith('/dashboard/')) {
    const hasAccess = checkRoleAccess(profile.role, path);
    if (!hasAccess) {
      return NextResponse.redirect(
        new URL(getDashboardPath(profile.role), request.url)
      );
    }
  }

  return response;
}

function getDashboardPath(role: string): string {
  const paths = {
    admin: "/dashboard/admin",
    staff: "/dashboard/staff", 
    secretary: "/dashboard/secretary"
  };
  return paths[role as keyof typeof paths] || "/dashboard";
}

function checkRoleAccess(role: string, path: string): boolean {
  if (role === "admin") return true;
  if (path === "/dashboard") return true;
  return path.startsWith(`/dashboard/${role}`);
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/:path*', '/'],
};