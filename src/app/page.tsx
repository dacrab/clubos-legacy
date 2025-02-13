import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LoginForm } from "@/components/auth/LoginForm"
import { Toaster } from "sonner"

interface LoginPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient()
  const returnTo = (await searchParams)?.from as string

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // If user is authenticated and we have a returnTo URL, get their profile
    if (user && !userError && returnTo) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      // Redirect to appropriate dashboard based on role
      if (profile?.role) {
        return redirect(`/dashboard/${profile.role}`)
      }
    }
  } catch (error) {
    console.error("Auth check error:", error)
  }

  // Show login form by default
  return (
    <main className="flex min-h-screen items-center justify-center">
      <LoginForm returnTo={returnTo} />
      <Toaster />
    </main>
  )
}
