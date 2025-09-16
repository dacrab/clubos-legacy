'use client';

import type { User } from '@supabase/supabase-js';
// External Dependencies
import type { UserRole } from '@/lib/constants';
// Internal Components
import Header from './header';

// Types
type EmployeeLayoutProps = {
  children: React.ReactNode;
  user: User;
  profile: {
    username: string | null;
    role: UserRole;
    id: string;
    created_at: string;
    [key: string]: unknown;
  };
};

export default function EmployeeLayout({ user, profile, children }: EmployeeLayoutProps) {
  return (
    <div className="min-h-screen bg-linear-to-b from-background to-secondary/10">
      <Header profile={profile} user={user} />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
