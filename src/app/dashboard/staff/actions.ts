"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createNewRegister() {
  const supabase = await createClient()
  
  await supabase
    .from("registers")
    .insert({
      opened_at: new Date().toISOString(),
      items_sold: 0,
      coupons_used: 0,
      treat_items_sold: 0,
      total_amount: 0,
    })
    .select()
    .single()
    .throwOnError()

  revalidatePath("/dashboard/staff")
} 