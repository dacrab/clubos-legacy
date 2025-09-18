import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALLOWED_USER_ROLES, DEFAULT_USER_ROLE } from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';
import { useErrorHandling } from './use-error-handling';

type User = Database['public']['Tables']['users']['Row'];
type UserRole = (typeof ALLOWED_USER_ROLES)[number];

type UserProfile = {
  id: string;
  username: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

type UseAuthProps = {
  redirectOnUnauthorized?: boolean;
  redirectPath?: string;
  requireAdmin?: boolean;
  enableErrorToasts?: boolean;
};

type AuthState = {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
};

type AuthActions = {
  refetch: () => Promise<void>;
  reset: () => void;
  signOut: () => Promise<void>;
};

export function useAuth({
  redirectOnUnauthorized = true,
  redirectPath = '/',
  requireAdmin = false,
  enableErrorToasts = true,
}: UseAuthProps = {}): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { error, handleError, reset } = useErrorHandling({
    showToasts: enableErrorToasts,
    defaultErrorMessage: 'Σφάλμα πιστοποίησης',
  });
  const router = useRouter();
  const supabase = createClientSupabase();

  const fetchUserData = useCallback(async (): Promise<void> => {
    setLoading(true);
    reset();

    try {
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !currentUser) {
        if (redirectOnUnauthorized) {
          router.push(redirectPath);
        }
        return;
      }

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        throw new Error('Σφάλμα φόρτωσης προφίλ χρήστη');
      }

      const role = (userProfile?.role as UserRole) || DEFAULT_USER_ROLE;

      // Check admin requirement
      if (requireAdmin && !ALLOWED_USER_ROLES.includes(role)) {
        if (redirectOnUnauthorized) {
          router.push('/dashboard');
        }
        return;
      }

      setUser({
        id: currentUser.id,
        username: userProfile.username,
        role: role as UserRole,
        is_active: true,
        created_at: userProfile.created_at,
        updated_at: userProfile.updated_at,
      });
      setProfile({
        id: userProfile.id,
        username: userProfile.username,
        role,
        created_at: userProfile.created_at,
        updated_at: userProfile.updated_at,
      });
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [supabase, router, redirectOnUnauthorized, redirectPath, requireAdmin, handleError, reset]);

  const refetch = useCallback(() => {
    return fetchUserData();
  }, [fetchUserData]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    router.push('/');
  }, [supabase, router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const isAdmin = profile ? ALLOWED_USER_ROLES.includes(profile.role) : false;

  return {
    user,
    profile,
    isAdmin,
    loading,
    error,
    refetch,
    reset,
    signOut,
  };
}
