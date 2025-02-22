import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// UI Components
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

// Database
import { createClient } from "@/lib/supabase/server"

export default function NewUserPage() {
  // Server Actions
  async function createUser(formData: FormData) {
    'use server'
    
    const supabase = await createClient()
    
    // Get form data
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const role = formData.get('role') as 'admin' | 'staff' | 'secretary'

    // Create auth user
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

    // Update user profile
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

  // Form Fields
  const formFields = [
    {
      id: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Enter name',
    },
    {
      id: 'email', 
      label: 'Email',
      type: 'email',
      placeholder: 'Enter email',
    },
    {
      id: 'password',
      label: 'Password', 
      type: 'password',
      placeholder: 'Enter password',
    }
  ]

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
            {formFields.map(field => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>
                <Input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  required
                />
              </div>
            ))}
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