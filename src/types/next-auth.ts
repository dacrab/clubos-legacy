import type { NextRequest } from 'next/server';

export type PageProps = {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
};

export type RouteContext<T = unknown> = {
  params: Promise<T>;
};

export type RouteHandler<T = unknown> = (
  request: NextRequest,
  context: RouteContext<T>
) => Promise<Response>;

// Re-export Stack Auth types for compatibility
export type { StackUser, UserProfile, ExtendedUser } from './stack-auth';
