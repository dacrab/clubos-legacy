import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()

    // Soft delete the user by updating is_deleted flag
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        is_deleted: true,
      })
      .eq('id', params.id)

    if (profileError) {
      return new NextResponse("Failed to delete user", { status: 500 })
    }

    return new NextResponse(null, { status: 303, headers: { Location: '/dashboard/users' } })
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 