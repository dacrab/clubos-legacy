"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  returnTo?: string
}

const errorMessages = {
  invalidCredentials: {
    title: "Invalid credentials",
    description: "The email or password you entered is incorrect."
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

export function LoginForm({ returnTo }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)
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

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get("email")?.toString(),
      password: formData.get("password")?.toString()
    }

    try {
      const validatedData = loginSchema.parse(data)

      const response = await fetch('/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const error = errorData.error?.toLowerCase() || ''
        
        if (error.includes("invalid") || error.includes("password") || error.includes("user")) {
          handleError('invalidCredentials')
        } else if (error.includes("profile")) {
          handleError('profileError')
        } else {
          handleError('connectionError')
        }
        return
      }

      const { role } = await response.json()
      
      if (!role || !['admin', 'staff', 'secretary'].includes(role)) {
        handleError('profileError')
        return
      }

      toast.success("Welcome back!", {
        description: "Successfully signed in."
      })

      router.push(`/dashboard/${role}`)
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
      <form 
        onSubmit={handleSubmit} 
        className="space-y-4"
        aria-label="Login form"
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            placeholder="m@example.com"
            required
            type="email"
            autoComplete="email"
            aria-label="Email address"
            className="w-full"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            required
            type="password"
            autoComplete="current-password"
            aria-label="Password"
            className="w-full"
          />
        </div>
        <Button 
          className="w-full"
          type="submit" 
          disabled={isLoading}
          aria-label={isLoading ? "Signing in..." : "Sign in"}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  )
}