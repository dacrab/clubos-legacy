import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { UsersTable } from "@/components/users/UsersTable"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: users = [] } = await supabase
    .from("profiles")
    .select("*")
    .order("name")

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Users"
        description="Manage system users"
      >
        <Link href="/dashboard/users/new">
          <Button>Add User</Button>
        </Link>
      </DashboardHeader>
      <UsersTable users={users} />
    </DashboardShell>
  )
}