import { Tables } from './supabase';
import { UserRole } from '@/lib/constants';

export type User = Omit<Tables<'users'>, 'role'> & {
  role: UserRole;
}; 