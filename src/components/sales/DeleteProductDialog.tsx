'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Trash2 } from "lucide-react"
import { deleteSaleItem } from "@/app/dashboard/staff/actions"
import { useToast } from "@/components/ui/use-toast"

interface DeleteSaleItemDialogProps {
  saleItemId: string
  productName: string
  userId: string
  onDelete: () => void
}

export function DeleteSaleItemDialog({
  saleItemId,
  productName,
  userId,
  onDelete
}: DeleteSaleItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const result = await deleteSaleItem({
        saleItemId,
        userId
      })

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Sale item deleted",
        description: "The sale item has been successfully deleted."
      })
      
      onDelete()
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete sale item. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Sale Item</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {productName} from this sale? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 