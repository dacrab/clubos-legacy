import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Attempt sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      // Handle specific auth errors
      switch (authError.message) {
        case "Invalid login credentials":
          return NextResponse.json(
            { error: "Invalid login credentials" },
            { status: 401 }
          )
        case "Email not confirmed":
          return NextResponse.json(
            { error: "Please verify your email address before signing in" },
            { status: 401 }
          )
        default:
          return NextResponse.json(
            { error: authError.message },
            { status: 400 }
          )
      }
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      return NextResponse.json(
        { error: "Failed to get user profile" },
        { status: 400 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      )
    }

    // Set the session cookie
    const response = NextResponse.json(
      { 
        user: authData.user,
        role: profile.role 
      },
      { status: 200 }
    )

    return response
  } catch (error) {
    console.error("Sign-in error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
} 