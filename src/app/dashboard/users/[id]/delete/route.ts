import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

type RequestContext = {
  params: { id: string }
}

export async function DELETE(
  request: NextRequest,
  { params: { id } }: RequestContext
) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()

    // Verify admin user
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (currentProfile?.role !== 'admin') {
      return NextResponse.json(
        { message: "Only admins can delete users" },
        { status: 403 }
      )
    }

    // Verify user exists
    const { data: userToDelete } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', id)
      .single()

    if (!userToDelete) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Delete user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(id)
    if (deleteError) {
      return NextResponse.json(
        { message: deleteError.message },
        { status: 500 }
      )
    }

    // Verify deletion
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