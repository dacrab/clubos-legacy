import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { ALLOWED_USER_ROLES, DEFAULT_USER_ROLE } from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type User = Database['public']['Tables']['users']['Row'];
type UserRole = (typeof ALLOWED_USER_ROLES)[number];

type UserProfile = {
  id: string;
  username: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

type UseUserManagementProps = {
  redirectOnUnauthorized?: boolean;
  redirectPath?: string;
};

type UserManagementState = {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
};

type UserManagementActions = {
  refetch: () => Promise<void>;
  clearError: () => void;
};

export function useUserManagement({
  redirectOnUnauthorized = true,
  redirectPath = '/',
}: UseUserManagementProps = {}): UserManagementState & UserManagementActions {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientSupabase();

  const fetchUserData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

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
      const errorMessage = err instanceof Error ? err.message : 'Σφάλμα φόρτωσης χρήστη';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [supabase, router, redirectOnUnauthorized, redirectPath]);

  const refetch = useCallback(() => {
    return fetchUserData();
  }, [fetchUserData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
    clearError,
  };
}
