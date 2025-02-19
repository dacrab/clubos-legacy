'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { CalendarPlus } from "lucide-react"
import { z } from "zod"

// Validation schema
const appointmentSchema = z.object({
  type: z.enum(["football", "party"]),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Customer phone is required"),
  notes: z.string().optional(),
  guests: z.number().min(0).optional(),
})

type AppointmentFormData = {
  type: "football" | "party"
  startTime: string
  endTime: string
  customerName: string
  customerPhone: string
  notes: string
  guests?: number
}

const initialFormData: AppointmentFormData = {
  type: "football",
  startTime: "",
  endTime: "",
  customerName: "",
  customerPhone: "",
  notes: "",
  guests: undefined,
}

export function NewAppointmentDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<AppointmentFormData>(initialFormData)

  const handleInputChange = (field: keyof AppointmentFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === "guests" ? Number(e.target.value) : e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setIsOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const validatedData = appointmentSchema.parse(formData)
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("appointments")
        .insert([
          {
            type: validatedData.type,
            start_time: validatedData.startTime,
            end_time: validatedData.endTime,
            customer_name: validatedData.customerName,
            customer_phone: validatedData.customerPhone,
            notes: validatedData.notes,
            guests: validatedData.guests,
            created_by: user.id,
          }
        ])

      if (error) throw error

      toast.success("Success", {
        description: "Appointment created successfully."
      })

      resetForm()
    } catch (error) {
      console.error("Create appointment error:", error)
      
      if (error instanceof z.ZodError) {
        toast.error("Validation Error", {
          description: error.errors[0].message
        })
      } else if (error instanceof Error) {
        toast.error("Error", {
          description: error.message || "Failed to create appointment. Please try again."
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <CalendarPlus className="h-4 w-4" />
        New Appointment
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>
              Book a new appointment for football field or party.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "football" | "party") => 
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="football">Football Field</SelectItem>
                  <SelectItem value="party">Party</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={handleInputChange("startTime")}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={handleInputChange("endTime")}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={handleInputChange("customerName")}
                placeholder="Enter customer name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange("customerPhone")}
                placeholder="Enter customer phone"
                required
              />
            </div>

            {formData.type === "party" && (
              <div className="space-y-2">
                <Label htmlFor="guests">Number of Guests</Label>
                <Input
                  id="guests"
                  type="number"
                  min={0}
                  value={formData.guests || ""}
                  onChange={handleInputChange("guests")}
                  placeholder="Enter number of guests"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={handleInputChange("notes")}
                placeholder="Enter any additional notes"
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Appointment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
} 