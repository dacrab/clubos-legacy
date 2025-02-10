import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const supabase = createClient()

  await (await supabase).auth.signOut()

  return NextResponse.redirect(`${requestUrl.origin}`, {
    status: 301,
  })
} 