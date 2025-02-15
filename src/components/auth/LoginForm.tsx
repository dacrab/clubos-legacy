"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Eye, EyeOff } from "lucide-react"

interface LoginFormProps {
  returnTo?: string
}

const errorMessages = {
  invalidCredentials: {
    title: "Invalid credentials",
    description: "The email or password you entered is incorrect."
  },
  missingFields: {
    title: "Missing information",
    description: "Please provide both email and password."
  },
  profileError: {
    title: "Profile error",
    description: "Unable to retrieve your user profile. Please try again."
  },
  connectionError: {
    title: "Connection error",
    description: "Unable to connect to the server. Please check your internet connection and try again."
  }
}

export function LoginForm({ returnTo }: LoginFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleError = (errorType: keyof typeof errorMessages) => {
    toast.error(errorMessages[errorType].title, {
      description: errorMessages[errorType].description
    })
    setIsLoading(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email")?.toString()
    const password = formData.get("password")?.toString()

    if (!email || !password) {
      handleError('missingFields')
      return
    }

    try {
      const response = await fetch('/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      if (!response.ok) {
        const data = await response.json()
        const error = data.error?.toLowerCase()
        
        if (error?.includes("invalid")) handleError('invalidCredentials')
        else if (error?.includes("profile")) handleError('profileError')
        else handleError('connectionError')
        return
      }

      const { role } = await response.json()
      
      if (!role || !['admin', 'staff', 'secretary'].includes(role)) {
        throw new Error('Invalid role received')
      }

      toast.success("Welcome back!", {
        description: "Successfully signed in."
      })

      await router.push(returnTo || `/dashboard/${role}`)

    } catch (error) {
      console.error("Login error:", error)
      handleError('connectionError')
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="user@example.com"
              required
              disabled={isLoading}
              autoComplete="email"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password123"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                )}
                <span className="sr-only">
                  {showPassword ? "Hide password" : "Show password"}
                </span>
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}