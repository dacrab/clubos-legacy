'use client';

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface CloseRegisterDialogProps {
  activeRegisterId: string
  totalAmount: number
  itemsSold: number
  couponsUsed: number
  treatsCount: number
}

export function CloseRegisterDialog({
  activeRegisterId,
  totalAmount,
  itemsSold,
  couponsUsed,
  treatsCount,
}: CloseRegisterDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [closedBy, setClosedBy] = useState("")

  const handleClose = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to close the register.",
      })
      setIsLoading(false)
      return
    }

    try {
      await supabase
        .from("registers")
        .update({
          closed_at: new Date().toISOString(),
          closed_by: user.id,
          closed_by_name: closedBy,
          items_sold: itemsSold,
          coupons_used: couponsUsed,
          treat_items_sold: treatsCount,
          total_amount: totalAmount,
        })
        .eq("id", activeRegisterId)
        .throwOnError()

      toast({
        title: "Success",
        description: "Register closed successfully.",
      })

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Close register error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to close register. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Close Register</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Register</DialogTitle>
          <DialogDescription>
            Please enter your name to close the register.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleClose} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="closedBy">Your Name</Label>
            <Input
              id="closedBy"
              value={closedBy}
              onChange={(e) => setClosedBy(e.target.value)}
              placeholder="Enter your name"
              required
              disabled={isLoading}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={isLoading || !closedBy}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Close Register
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}