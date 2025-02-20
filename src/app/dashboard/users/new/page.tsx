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
import { revalidatePath } from "next/cache"

export default function NewUserPage() {
  async function createUser(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as 'admin' | 'staff' | 'secretary'

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
        data: {
          name,
        },
      },
    })

    if (signUpError) {
      throw new Error(signUpError.message)
    }

    // Update user role in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role,
        email,
        name,
      })
      .eq('email', email)

    if (profileError) {
      throw new Error(profileError.message)
    }

    revalidatePath('/dashboard/users')
    redirect('/dashboard/users')
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="New User"
        description="Create a new user account"
      />
      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select name="role" required defaultValue="staff">
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
            <Button type="submit">Create User</Button>
          </form>
        </CardContent>
      </Card>
    </DashboardShell>
  )
} 