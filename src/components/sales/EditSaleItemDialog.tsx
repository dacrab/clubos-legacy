'use client'

import { useEffect, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Check, ChevronsUpDown } from "lucide-react"
import { editSaleItem } from "@/app/dashboard/staff/actions"
import { useToast } from "@/components/ui/use-toast"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

interface Product {
  id: string
  name: string
  price: number
  stock: number
}

interface EditSaleItemDialogProps {
  saleItemId: string
  productName: string
  currentQuantity: number
  currentProductId: string
  userId: string
  onEdit: () => void
  createdAt: string
}

export function EditSaleItemDialog({
  saleItemId,
  productName,
  currentQuantity,
  currentProductId,
  userId,
  onEdit,
  createdAt
}: EditSaleItemDialogProps) {
  const [open, setOpen] = useState(false)
  const [quantity, setQuantity] = useState(currentQuantity)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const { toast } = useToast()

  const canEdit = () => {
    const created = new Date(createdAt)
    const now = new Date()
    return (now.getTime() - created.getTime()) / (1000 * 60) <= 5
  }

  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (!open) return

    const updateTime = () => {
      const created = new Date(createdAt)
      const now = new Date()
      setTimeLeft(Math.max(0, 300 - Math.floor((now.getTime() - created.getTime()) / 1000)))
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [open, createdAt])

  useEffect(() => {
    if (!open) return

    const fetchProducts = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock')
        .eq('is_deleted', false)
        .order('name')

      if (error) {
        toast({ title: "Error", description: "Failed to load products. Please try again.", variant: "destructive" })
        return
      }

      if (data) {
        setProducts(data)
        const current = data.find(p => p.id === currentProductId)
        if (current) setSelectedProduct(current)
      }
    }

    fetchProducts()
  }, [open, currentProductId, toast])

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId)
    if (product && (product.stock === -1 || product.stock > 0)) {
      setSelectedProduct(product)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canEdit() || !selectedProduct) return setOpen(false)
    if (quantity === currentQuantity && selectedProduct.id === currentProductId) return setOpen(false)

    setIsLoading(true)

    try {
      const result = await editSaleItem({ saleItemId, quantity, productId: selectedProduct.id, userId })
      if (result.error) throw new Error(result.error)
      
      toast({ title: "Sale item updated", description: "The sale item has been successfully updated." })
      onEdit()
      setOpen(false)
    } catch (error) {
      toast({ title: "Error", description: "Failed to update sale item. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const isEditable = canEdit()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          disabled={!isEditable}
          title={!isEditable ? "Orders can only be edited within 5 minutes of creation" : "Edit order"}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Sale Item</DialogTitle>
          <DialogDescription>Make changes to {productName}</DialogDescription>
          <div className="mt-2 text-sm">
            {isEditable ? (
              <p className="text-muted-foreground">Time remaining: {formatTimeLeft(timeLeft)}</p>
            ) : (
              <p className="text-red-500">This order cannot be edited as it was created more than 5 minutes ago</p>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="product">Product</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="product"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                    disabled={!isEditable}
                  >
                    {selectedProduct?.name || productName}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 overflow-hidden z-[9999]" align="start" sideOffset={4}>
                  <Command>
                    <CommandInput placeholder="Search products..." />
                    <CommandList>
                      <CommandEmpty>No products found.</CommandEmpty>
                      <CommandGroup heading="Available Products">
                        {products.map((product) => {
                          const isAvailable = product.stock === -1 || product.stock > 0
                          const isSelected = selectedProduct?.id === product.id
                          
                          return (
                            <CommandItem
                              key={product.id}
                              value={product.id}
                              onSelect={() => handleProductSelect(product.id)}
                              className={cn("flex items-center justify-between", !isAvailable && "opacity-50")}
                            >
                              <div className="flex items-center gap-2">
                                <Check className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                                <span>{product.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {product.stock === -1 ? "∞" : product.stock}
                              </span>
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={!isEditable}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="submit"
              disabled={isLoading || !isEditable || !selectedProduct || 
                (quantity === currentQuantity && selectedProduct.id === currentProductId)}
            >
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}