import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Role } from "@/types"
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    console.log("Login attempt for:", email)
    
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      console.error("Auth error:", authError)
      return NextResponse.json(
        { error: authError?.message || "Authentication failed" },
        { status: 401 }
      )
    }

    console.log("Auth successful for user:", authData.user.id)

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, email")
      .eq("id", authData.user.id)
      .single()

    if (profileError || !profile) {
      console.error("Profile error:", profileError)
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      )
    }

    console.log("Profile found:", { email: profile.email, role: profile.role })

    // Validate that the role is one of the expected values
    if (!['admin', 'staff', 'secretary'].includes(profile.role)) {
      console.error("Invalid role:", profile.role)
      return NextResponse.json(
        { error: "Invalid user role" },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const response = NextResponse.json(
      { role: profile.role as Role },
      { status: 200 }
    )

    if (authData.session) {
      const { access_token, refresh_token } = authData.session
      
      // Set cookies with strict security options
      response.cookies.set('sb-access-token', access_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      })

      response.cookies.set('sb-refresh-token', refresh_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      })
    }

    return response

  } catch (error) {
    console.error("Sign-in error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}