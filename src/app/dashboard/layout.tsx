import { createServerClient } from '@supabase/ssr';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardLayoutClient from '@/components/dashboard/layout/dashboard-layout-client';
import { PageWrapper } from '@/components/ui/page-wrapper';
import type { UserRole } from '@/lib/constants';
import { env } from '@/lib/env';
import type { Database } from '@/types/supabase';

export const metadata: Metadata = {
  title: 'Dashboard | clubOS',
  description: 'clubOS Dashboard',
};

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!(supabaseUrl && supabaseAnonKey)) {
    // Handle missing environment variables, maybe redirect to an error page
    return redirect('/error');
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value ?? '';
      },
    },
  });

  try {
    // Authentication check
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return redirect('/');
    }

    // Get user data
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('username, role, id, created_at, updated_at')
      .eq('id', user.id)
      .single();

    if (userDataError) {
      // Throw an error or redirect to an error page
      // For now, we'll redirect to the home page
      return redirect('/');
    }

    const profile: {
      username: string;
      role: UserRole;
      id: string;
      created_at: string;
      updated_at: string;
    } = {
      username: userData.username,
      role: userData.role,
      id: userData.id,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
    };

    return (
      <PageWrapper variant="dashboard">
        <DashboardLayoutClient profile={profile}>{children}</DashboardLayoutClient>
      </PageWrapper>
    );
  } catch (_error) {
    return redirect('/');
  }
}
