"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Role } from "@/types"

interface LoginFormProps {
  returnTo?: string;
}

export function LoginForm({ returnTo }: LoginFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const email = formData.get("email")
      const password = formData.get("password")

      // Basic validation
      if (!email || !password) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please fill in all fields",
        })
        setIsLoading(false)
        return
      }

      const response = await fetch('/auth/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("Login error:", data.error)
        // Handle specific error cases
        switch (data.error?.toLowerCase()) {
          case "invalid login credentials":
            toast({
              variant: "destructive",
              title: "Invalid credentials",
              description: "The email or password you entered is incorrect.",
            })
            break
          case "email and password are required":
            toast({
              variant: "destructive",
              title: "Missing information",
              description: "Please provide both email and password.",
            })
            break
          case "failed to get user profile":
            toast({
              variant: "destructive",
              title: "Profile error",
              description: "Unable to retrieve your user profile. Please try again.",
            })
            break
          default:
            toast({
              variant: "destructive",
              title: "Error",
              description: data.error || "An unexpected error occurred. Please try again.",
            })
        }
        setIsLoading(false)
        return
      }

      // Success case
      toast({
        title: "Welcome back!",
        description: "Successfully signed in. Redirecting...",
      })

      // Ensure we have a valid role
      const role = data.role as Role
      if (!role || !['admin', 'staff', 'secretary'].includes(role)) {
        console.error("Invalid role received:", role)
        throw new Error('Invalid role received')
      }

      // Use the returnTo URL if provided, otherwise go to role-specific dashboard
      const redirectPath = returnTo || `/dashboard/${role}`
      router.replace(redirectPath)
      router.refresh()

    } catch (error) {
      console.error("Login error:", error)
      toast({
        variant: "destructive",
        title: "Connection error",
        description: "Unable to connect to the server. Please check your internet connection and try again.",
      })
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
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
              className="w-full"
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
              className="w-full"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}