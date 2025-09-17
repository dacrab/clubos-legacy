import { createBrowserClient } from '@supabase/ssr';
import { env } from '@/lib/env';
import type { Category } from '@/types/database';
import type { Database } from '@/types/supabase';

export type Tables = Database['public']['Tables'];
export type User = Tables['users']['Row'];

// Type guard for checking if a value is a Category
export function isCategory(value: unknown): value is Category {
  return value !== null && typeof value === 'object' && 'id' in value && 'name' in value;
}

export function createClientSupabase() {
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
