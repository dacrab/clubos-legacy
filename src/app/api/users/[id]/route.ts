import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()

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
        JSON.stringify({ message: "Only admins can delete users" }),
        { status: 403 }
      )
    }

    // Get user to delete
    const { data: userToDelete } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', params.id)
      .single()

    if (!userToDelete) {
      return new NextResponse(
        JSON.stringify({ message: "User not found" }),
        { status: 404 }
      )
    }

    // Delete user from auth.users
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(
      params.id
    )

    if (deleteAuthError) {
      return new NextResponse(
        JSON.stringify({ message: deleteAuthError.message }),
        { status: 500 }
      )
    }

    // The profile will be automatically deleted due to the ON DELETE CASCADE constraint
    // But let's verify the deletion
    const { data: deletedProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', params.id)
      .single()

    if (deletedProfile) {
      return new NextResponse(
        JSON.stringify({ message: "Failed to delete user profile" }),
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