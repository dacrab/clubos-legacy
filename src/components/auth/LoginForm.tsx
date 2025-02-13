"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

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
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleError = (errorType: keyof typeof errorMessages) => {
    toast({
      variant: "destructive",
      ...errorMessages[errorType]
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
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const data = await response.json()
        const error = data.error?.toLowerCase()
        
        if (error.includes("invalid")) handleError('invalidCredentials')
        else if (error.includes("profile")) handleError('profileError')
        else handleError('connectionError')
        return
      }

      const { role } = await response.json()
      if (!['admin', 'staff', 'secretary'].includes(role)) {
        throw new Error('Invalid role received')
      }

      toast({
        title: "Welcome back!",
        description: "Successfully signed in. Redirecting...",
      })

      router.replace(returnTo || `/dashboard/${role}`)
      router.refresh()

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
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="Password123"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}