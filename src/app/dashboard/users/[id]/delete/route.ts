import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Verify admin permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { message: "Only admins can delete users" }, 
        { status: 403 }
      )
    }

    // Verify target user exists
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', id)
      .single()

    if (!targetUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    // Delete the user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(id)
    if (deleteError) {
      return NextResponse.json(
        { message: deleteError.message },
        { status: 500 }
      )
    }

    // Verify deletion was successful
    const { data: deletedProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .single()

    if (deletedProfile) {
      return NextResponse.json(
        { message: "Failed to delete user profile" },
        { status: 500 }
      )
    }

    return NextResponse.json(null, { status: 200 })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "An unexpected error occurred" },
      { status: 500 }
    )
  }
}