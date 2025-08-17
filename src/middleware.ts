import { NextResponse, type NextRequest } from "next/server";

import { stackServerApp } from "@/lib/auth";
import { logger } from "@/lib/utils/logger";

export async function middleware(request: NextRequest) {
  // Skip auth check for public routes, API routes, and handler routes
  if (request.nextUrl.pathname === '/' || 
      request.nextUrl.pathname.startsWith('/api/') ||
      request.nextUrl.pathname.startsWith('/handler/')) {
    return NextResponse.next();
  }

  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.redirect(new URL('/handler/sign-in', request.url));
    }
    return NextResponse.next();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Middleware error:', error);
    }
    return NextResponse.redirect(new URL('/handler/sign-in', request.url));
  }
}

export const config = {
  // You can add your own route protection logic here
  // Make sure not to protect the root URL, as it would prevent users from accessing static Next.js files or Stack's /handler path
  matcher: '/dashboard/:path*',
};