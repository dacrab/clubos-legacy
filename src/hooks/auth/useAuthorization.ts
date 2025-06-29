import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabase } from '@/lib/supabase/client';
import { ALLOWED_USER_ROLES } from '@/lib/constants';

type AuthorizationStatus = 'loading' | 'authorized' | 'unauthorized';

export function useAuthorization(role: string = ALLOWED_USER_ROLES[0]) {
  const [status, setStatus] = useState<AuthorizationStatus>('loading');
  const router = useRouter();
  const supabase = createClientSupabase();

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/');
          setStatus('unauthorized');
          return;
        }

        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || !userData || userData.role !== role) {
          router.push('/dashboard');
          setStatus('unauthorized');
          return;
        }

        setStatus('authorized');
      } catch (error) {
        console.error('Authorization error:', error);
        router.push('/dashboard');
        setStatus('unauthorized');
      }
    };

    checkPermissions();
  }, [router, supabase, role]);

  return status;
} 