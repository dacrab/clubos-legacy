import { type NextRequest } from 'next/server'

export type RouteContext<T = any> = {
  params: Promise<T>
}

export type RouteHandler<T = any> = (
  request: NextRequest,
  context: RouteContext<T>
) => Promise<Response>
