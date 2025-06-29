import { NextRequest } from 'next/server';
import { User } from "./users";

export type PageProps = {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key:string]: string | string[] | undefined };
};

export type UserProfile = User;

export type RouteContext<T = any> = {
  params: Promise<T>
}

export type RouteHandler<T = any> = (
  request: NextRequest,
  context: RouteContext<T>
) => Promise<Response> 