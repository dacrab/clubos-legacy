"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { z } from "zod"
import { signIn, getUserProfile } from "@/lib/supabase/client"

const DOMAIN = "example.com"

const loginSchema = z.object({
  username: z.string().min(1, "Please enter your username"),
  password: z.string().min(6, "Password must be at least 6 characters")
})


const errorMessages = {
  invalidCredentials: {
    title: "Invalid credentials",
    description: "The username or password you entered is incorrect."
  },
  profileError: {
    title: "Profile error",
    description: "Unable to retrieve your user profile. Please try again."
  },
  connectionError: {
    title: "Connection error",
    description: "Unable to connect to the server. Please check your internet connection and try again."
  }
} as const

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const router = useRouter()

  const handleError = (errorType: keyof typeof errorMessages) => {
    toast.error(errorMessages[errorType].title, {
      description: errorMessages[errorType].description
    })
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const validatedData = loginSchema.parse(formData)
      const email = `${validatedData.username}@${DOMAIN}`

      // Sign in with Supabase
      await signIn(email, validatedData.password)

      // Get user profile
      const profile = await getUserProfile()
      
      if (!profile || !['admin', 'staff', 'secretary'].includes(profile.role)) {
        handleError('profileError')
        return
      }

      toast.success("Welcome back!", {
        description: "Successfully signed in."
      })

      router.push(`/dashboard/${profile.role}`)
      router.refresh()

    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error("Validation Error", {
          description: error.errors[0].message
        })
      } else {
        console.error("Login error:", error)
        handleError('connectionError')
      }
    } finally {
      setIsLoading(false)
    }
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
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
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
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
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