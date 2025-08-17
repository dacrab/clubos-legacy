import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { logger } from '@/lib/utils/logger';

import { useUser } from '@/lib/auth-client';
import { ALLOWED_USER_ROLES } from '@/lib/constants';

type AuthorizationStatus = 'loading' | 'authorized' | 'unauthorized';

export function useAuthorization(role: string = ALLOWED_USER_ROLES[0]) {
  const [status, setStatus] = useState<AuthorizationStatus>('loading');
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (!user) {
          router.push('/');
          setStatus('unauthorized');
          return;
        }

        // Check user role via API
        const response = await fetch(`/api/users/${user.id}`);
        if (!response.ok) {throw new Error('Failed to fetch user data');}
        const userData = await response.json();
        if (!userData || userData.role !== role) {
          router.push('/dashboard');
          setStatus('unauthorized');
          return;
        }

        setStatus('authorized');
      } catch (error) {
        logger.error('Authorization error:', error);
        router.push('/dashboard');
        setStatus('unauthorized');
      }
    };

    checkPermissions();
  }, [router, user, role]);

  return status;
} 