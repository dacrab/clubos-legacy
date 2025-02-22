"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { SelectField } from "@/components/ui/select-field"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { UserPlus } from "lucide-react"
import { z } from "zod"
import { Role } from "@/types/app"

const DOMAIN = "example.com"

const userSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "staff", "secretary"] as const)
})

type UserFormData = {
  username: string
  password: string
  role: Role
}

const initialFormData: UserFormData = {
  username: "",
  password: "",
  role: "staff"
}

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
  { value: "secretary", label: "Secretary" }
]

export function NewUserDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<UserFormData>(initialFormData)

  const handleInputChange = (field: keyof UserFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setIsOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const validatedData = userSchema.parse(formData)
      const email = `${validatedData.username}@${DOMAIN}`

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...validatedData, email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message)
      }

      toast.success("Success", {
        description: "User created successfully."
      })

      resetForm()
      window.location.reload()
    } catch (error) {
      console.error("Create user error:", error)
      
      if (error instanceof z.ZodError) {
        toast.error("Validation Error", {
          description: error.errors[0].message
        })
      } else if (error instanceof Error) {
        toast.error("Error", {
          description: error.message || "Failed to create user. Please try again."
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <UserPlus className="h-4 w-4" />
        New User
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user account to the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <Input
                  id="username"
                  value={formData.username}
                  onChange={handleInputChange("username")}
                  placeholder="Enter username"
                  required
                  className="pr-24"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  @{DOMAIN}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange("password")}
                placeholder="Enter password"
                required
              />
            </div>
            <SelectField
              label="Role"
              value={formData.role}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value as UserFormData["role"] }))}
              options={roleOptions}
              placeholder="Select role"
              required
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}