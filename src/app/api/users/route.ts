import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const { username, email, password, role } = await request.json()

    // Check if user is admin
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) {
      return new NextResponse(
        JSON.stringify({ message: "Unauthorized" }),
        { status: 401 }
      )
    }

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (currentProfile?.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ message: "Only admins can create users" }),
        { status: 403 }
      )
    }

    // Create user with admin API
    const { data: userData, error: signUpError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: username },
    })

    if (signUpError || !userData.user) {
      return new NextResponse(
        JSON.stringify({ message: signUpError?.message || "Failed to create user" }),
        { status: 400 }
      )
    }

    // Update user role and profile
    const { error: updateError } = await adminClient
      .from('profiles')
      .update({ 
        role,
        name: username,
      })
      .eq('id', userData.user.id)

    if (updateError) {
      // If profile update fails, delete the created user
      await adminClient.auth.admin.deleteUser(userData.user.id)
      return new NextResponse(
        JSON.stringify({ message: "Failed to create user profile" }),
        { status: 500 }
      )
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("Create user error:", error)
    const message = error instanceof Error ? error.message : "An unexpected error occurred"
    return new NextResponse(
      JSON.stringify({ message }),
      { status: 500 }
    )
  }
} 