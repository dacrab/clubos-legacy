import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { name, email, password, role } = await request.json()

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
    const { error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (signUpError) {
      return new NextResponse(
        JSON.stringify({ message: signUpError.message }),
        { status: 400 }
      )
    }

    // Get the newly created user
    const { data: newUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (!newUser) {
      return new NextResponse(
        JSON.stringify({ message: "Failed to create user profile" }),
        { status: 500 }
      )
    }

    // Update user role
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role,
        name,
      })
      .eq('id', newUser.id)

    if (updateError) {
      return new NextResponse(
        JSON.stringify({ message: updateError.message }),
        { status: 500 }
      )
    }

    return new NextResponse(null, { status: 200 })
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ message: error.message }),
      { status: 500 }
    )
  }
} 