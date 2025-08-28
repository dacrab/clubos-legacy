import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";
import { Metadata } from "next";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { Database } from "@/types/supabase";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: 'Dashboard | clubOS',
  description: 'clubOS Dashboard',
};

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
  
  try {
    // Authentication check
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return redirect('/');
    }

    // Get user data
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('username, role, id, created_at, updated_at')    
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      console.error('User error:', userDataError);
      return redirect('/');
    }

    return (
      <PageWrapper variant="dashboard">
        <DashboardLayoutClient user={user} profile={userData}>
          {children}
        </DashboardLayoutClient>
      </PageWrapper>
    );
  } catch (error) {
    console.error('Dashboard layout error:', error);
    return redirect('/');
  }
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