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
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import { deleteSaleItem } from "@/app/dashboard/staff/actions"
import { DeleteSaleItemDialogProps } from "@/types/app"

export function DeleteSaleItemDialog({
  saleItemId,
  productName,
  userId,
  onDelete,
  createdAt
}: DeleteSaleItemDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if delete is allowed (within 5 minutes)
  const isDeleteAllowed = () => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffInMinutes = (now.getTime() - created.getTime()) / (1000 * 60)
    return diffInMinutes <= 5
  }

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

      toast.success("Sale item deleted", {
        description: "The sale item has been successfully deleted."
      })
      
      onDelete()
      setIsOpen(false)
    } catch (error) {
      toast.error("Error", {
        description: error instanceof Error ? error.message : "Failed to delete sale item. Please try again."
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
          className="h-8 w-8"
          disabled={!isDeleteAllowed()}
          title={!isDeleteAllowed() ? "Orders can only be deleted within 5 minutes of creation" : "Delete order"}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Sale Item</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {productName}?
            {!isDeleteAllowed() && (
              <p className="mt-2 text-red-500 text-sm">
                This order cannot be deleted as it was created more than 5 minutes ago
              </p>
            )}
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
            disabled={isLoading || !isDeleteAllowed()}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 