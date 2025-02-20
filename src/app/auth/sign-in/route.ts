import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Role } from "@/types"
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

const VALID_ROLES = ['admin', 'staff', 'secretary'] as const

async function validateCredentials(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email and password are required")
  }
}

async function authenticateUser(supabase: SupabaseClient<Database>, email: string, password: string) {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    console.error("Auth error:", authError)
    throw new Error(authError?.message || "Authentication failed")
  }

  return authData
}

async function getProfile(supabase: SupabaseClient<Database>, userId: string) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    console.error("Profile error:", profileError)
    throw new Error("User profile not found")
  }

  if (!VALID_ROLES.includes(profile.role)) {
    console.error("Invalid role:", profile.role)
    throw new Error("Invalid user role")
  }

  return profile
}

function createSecureCookie(name: string, value: string): {
  name: string;
  value: string;
  options: Partial<ResponseCookie>;
} {
  return {
    name,
    value,
    options: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    }
  }
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    console.log("Login attempt for:", email)

    await validateCredentials(email, password)

    const supabase = await createClient()
    const authData = await authenticateUser(supabase, email, password)
    console.log("Auth successful for user:", authData.user.id)

    const profile = await getProfile(supabase, authData.user.id)
    console.log("Profile found:", { email: profile.email, role: profile.role })

    const response = NextResponse.json(
      { role: profile.role as Role },
      { status: 200 }
    )

    if (authData.session) {
      const { access_token, refresh_token } = authData.session
      
      const accessTokenCookie = createSecureCookie('sb-access-token', access_token)
      const refreshTokenCookie = createSecureCookie('sb-refresh-token', refresh_token)

      response.cookies.set(accessTokenCookie.name, accessTokenCookie.value, accessTokenCookie.options)
      response.cookies.set(refreshTokenCookie.name, refreshTokenCookie.value, refreshTokenCookie.options)
    }

    return response

  } catch (error) {
    console.error("Sign-in error:", error)
    const status = error instanceof Error && error.message.includes("required") ? 400 : 500
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status }
    )
  }
}