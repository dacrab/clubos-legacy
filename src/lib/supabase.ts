// Re-export consolidated Supabase client utilities

// Re-export types
export type { Category } from '@/types/database';
export type { Database } from '@/types/supabase';
export {
  createAPISupabase,
  createClientSupabase,
  createServerSupabase,
  default as supabaseImageLoaderDefault,
  supabaseImageLoader,
} from './supabase-client';

import type { Category } from '@/types/database';
// Define common types
import type { Database } from '@/types/supabase';
export type Tables = Database['public']['Tables'];
export type User = Tables['users']['Row'];

// Type guard for checking if a value is a Category
export function isCategory(value: unknown): value is Category {
  return value !== null && typeof value === 'object' && 'id' in value && 'name' in value;
}
