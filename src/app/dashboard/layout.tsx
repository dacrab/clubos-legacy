import { Metadata } from 'next';
import { redirect } from "next/navigation";
import { cookies } from 'next/headers';
import { DashboardProvider } from "@/components/dashboard/provider/DashboardProvider";
import DashboardLayoutClient from '@/components/dashboard/layout/DashboardLayoutClient';
import { DashboardContextSetter } from "@/components/dashboard/provider/DashboardContextSetter";
import { createServerClient } from '@supabase/ssr';
import { UserProfile } from '@/types/next-auth';
import Header from '@/components/dashboard/layout/Header';
import { cn } from '@/lib/utils';
import { Database } from '@/types/supabase';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => (await cookies()).get(name)?.value,
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/');
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, username, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    console.error('Error fetching user profile:', profileError);
    // It might be better to sign out the user if their profile is missing
    return redirect('/');
  }

  const isAdmin = profile.role === 'admin';

  return (
    <DashboardProvider>
      <DashboardContextSetter isSidebarVisible={isAdmin} />
      <div className={cn("flex flex-1 flex-col", isAdmin && "lg:pl-72")}>
        <Header user={user} profile={profile as UserProfile} />
        <DashboardLayoutClient user={user} profile={profile as UserProfile}>
          {children}
        </DashboardLayoutClient>
      </div>
    </DashboardProvider>
  );
}

async function getUserRole() {
  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value ?? '';
        },
      },
    }
  );
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/');
  }

  const { data: userData, error: userDataError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userDataError) {
    console.error('User error:', userDataError);
    throw userDataError;
  }

  if (!userData) {
    redirect('/');
  }

  return userData.role;
}