import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import type { UserProfile } from '@/types/users';
import { stackServerApp } from '@/lib/auth';
import { getUserById } from '@/lib/db/services/users';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/utils/logger';
import DashboardLayoutClient from '@/components/dashboard/layout/DashboardLayoutClient';
import Header from '@/components/dashboard/layout/Header';
import { DashboardProvider } from '@/components/dashboard/provider/DashboardProvider';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await stackServerApp.getUser();

  if (!user) {
    return redirect('/');
  }

  const profile = await getUserById(user.id);

  if (!profile) {
    logger.error('Error fetching user profile');
    return redirect('/');
  }

  const isAdmin = profile.role === 'admin';

  // Transform profile to match UserProfile interface
  const userProfile: UserProfile = {
    id: profile.id,
    username: profile.username,
    role: profile.role,
    email: profile.email,
    displayName: user.displayName,
    isActive: true, // Assuming logged-in users are active
    profileImageUrl: user.profileImageUrl,
  };

  // Create a compatible profile object for Header
  const headerProfile = {
    username: profile.username,
  };

  return (
    <DashboardProvider>
      <div className={cn('flex flex-1 flex-col', isAdmin && 'lg:pl-72')}>
        <Header user={user} profile={headerProfile} />
        <DashboardLayoutClient profile={userProfile}>{children}</DashboardLayoutClient>
      </div>
    </DashboardProvider>
  );
}
