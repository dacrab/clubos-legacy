"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { z } from "zod"
import { createClient } from "@/lib/supabase/client"
import { LoginFormData, LoginErrorMessages } from "@/types/app"

const DOMAIN = "example.com"

const loginSchema = z.object({
  username: z.string().min(1, "Please enter your username"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

const ALLOWED_ROLES = ['admin', 'staff', 'secretary'] as const

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  })
  const router = useRouter()
  const supabase = createClient()

  const handleError = (errorType: keyof typeof LoginErrorMessages) => {
    toast.error(LoginErrorMessages[errorType].title, {
      description: LoginErrorMessages[errorType].description
    })
    setIsLoading(false)
  }

  const validateCredentials = (data: LoginFormData) => {
    return loginSchema.parse(data)
  }

  const signInUser = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const getUserProfile = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!user || error) throw new Error("Failed to get user profile")
    return user
  }

  const getRole = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    if (!profile || !ALLOWED_ROLES.includes(profile.role as typeof ALLOWED_ROLES[number])) {
      throw new Error("Invalid user role")
    }

    return profile.role
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading) return
    setIsLoading(true)

    try {
      const validatedData = validateCredentials(formData)
      const email = `${validatedData.username}@${DOMAIN}`

      await signInUser(email, validatedData.password)
      const user = await getUserProfile()
      const role = await getRole(user.id)

      toast.success("Welcome back!", {
        description: "Successfully signed in."
      })

      router.push(`/dashboard/${role}`)

    } catch (error) {
      console.error("Login error:", error)
      
      if (error instanceof z.ZodError) {
        toast.error("Validation Error", {
          description: error.errors[0].message
        })
      } else {
        handleError('connectionError')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to sign in
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <Input
              id="username"
              value={formData.username}
              onChange={handleInputChange('username')}
              placeholder="Your Username"
              type="text"
              autoComplete="username"
              className="w-full pr-24"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Your Password"
            value={formData.password}
            onChange={handleInputChange('password')}
            autoComplete="current-password"
            className="w-full"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  )
}