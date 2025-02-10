import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LoginForm } from "@/components/auth/LoginForm"
import { Toaster } from "@/components/ui/toaster"

export default async function LoginPage() {
  const supabase = await createClient()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.error("Auth error:", userError)
      return (
        <main className="flex min-h-screen items-center justify-center">
          <LoginForm />
          <Toaster />
        </main>
      )
    }

    if (user) {
      try {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Profile error:", profileError)
          return (
            <main className="flex min-h-screen items-center justify-center">
              <LoginForm />
              <Toaster />
            </main>
          )
        }

        if (profile) {
          switch (profile.role) {
            case "admin":
              redirect("/dashboard/admin")
            case "staff":
              redirect("/dashboard/staff")
            case "secretary":
              redirect("/dashboard/secretary")
            default:
              redirect("/dashboard")
          }
        }
      } catch (error) {
        console.error("Profile fetch error:", error)
      }
    }

    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoginForm />
        <Toaster />
      </main>
    )
  } catch (error) {
    console.error("Page error:", error)
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoginForm />
        <Toaster />
      </main>
    )
  }
}
