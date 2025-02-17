import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { redirect } from "next/navigation"

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const supabase = await createClient()

  // Fetch user data
  const { data: user } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!user) {
    redirect('/dashboard/users')
  }

  async function updateUser(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    const name = formData.get('name') as string
    const role = formData.get('role') as 'admin' | 'staff' | 'secretary'

    // Update user in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role,
        name,
      })
      .eq('id', params.id)

    if (profileError) {
      return { error: profileError.message }
    }

    redirect('/dashboard/users')
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Edit User"
        description="Edit user account details"
      />
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter name"
                defaultValue={user.name}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" required defaultValue={user.role}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="secretary">Secretary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Update User</Button>
          </form>
        </CardContent>
      </Card>
    </DashboardShell>
  )
} 