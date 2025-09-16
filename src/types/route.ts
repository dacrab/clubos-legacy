import type { NextRequest } from 'next/server';

export type RouteContext<T = Record<string, string>> = {
  params: T;
};

export type RouteHandler<T = Record<string, string>> = (
  request: NextRequest,
  context: RouteContext<T>
) => Promise<Response>;
