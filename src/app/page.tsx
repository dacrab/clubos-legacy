import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LoginForm } from "@/components/auth/LoginForm"

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient()
  const params = await searchParams
  const returnTo = params?.from as string

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // If user is authenticated, get their profile and redirect
    if (user && !userError) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      // Redirect to appropriate dashboard based on role
      if (profile?.role) {
        redirect(`/dashboard/${profile.role}`)
      }
    }
  } catch (error) {
    console.error("Auth check error:", error)
  }

  // Show login form for unauthenticated users
  return (
    <main className="flex min-h-screen items-center justify-center">
      <LoginForm returnTo={returnTo} />
    </main>
  )
}
