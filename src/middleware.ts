import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const AUTH_PAGES = ['/'];

export async function middleware(req: NextRequest) {
  // Skip auth check for public routes and API routes
  if (AUTH_PAGES.includes(req.nextUrl.pathname) || req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    
    if (!session) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*']
};