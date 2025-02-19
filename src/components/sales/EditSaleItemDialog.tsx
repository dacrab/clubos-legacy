'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil, Check, Search } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { editSaleItem } from "@/app/dashboard/staff/actions"
import { cn } from "@/lib/utils"

// Dialog Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Popover Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Constants
const EDIT_TIME_LIMIT = 5 * 60 // 5 minutes in seconds

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
  // Dialog state
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state
  const [quantity, setQuantity] = useState(currentQuantity)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(EDIT_TIME_LIMIT)

  // Time-related utilities
  const canEdit = () => {
    const created = new Date(createdAt)
    const now = new Date()
    return (now.getTime() - created.getTime()) / 1000 <= EDIT_TIME_LIMIT
  }

  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Timer effect
  useEffect(() => {
    if (!open) return

    const updateTime = () => {
      const elapsed = Math.floor((new Date().getTime() - new Date(createdAt).getTime()) / 1000)
      const remaining = Math.max(0, EDIT_TIME_LIMIT - elapsed)
      setTimeLeft(remaining)

      if (remaining === 0) {
        setOpen(false)
        toast.error("Time expired", {
          description: "The edit time limit has expired."
        })
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [open, createdAt])

  // Products fetch effect
  useEffect(() => {
    if (!open) return

    const fetchProducts = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('id, name, price, stock')
        .eq('is_deleted', false)
        .order('name')

      if (data) {
        setProducts(data)
        const current = data.find(p => p.id === currentProductId)
        if (current) setSelectedProduct(current)
      } else {
        toast.error("Error", { description: "Failed to load products. Please try again." })
      }
    }

    fetchProducts()
  }, [open, currentProductId])

  // Filtered products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Handlers
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    setSearchQuery("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedProduct) return setOpen(false)
    if (quantity === currentQuantity && selectedProduct.id === currentProductId) {
      return setOpen(false)
    }

    setIsLoading(true)

    try {
      const result = await editSaleItem({
        saleItemId,
        quantity,
        productId: selectedProduct.id,
        userId
      })

      if (result.error) throw result.error
      
      toast.success("Sale item updated", {
        description: "The sale item has been successfully updated."
      })
      onEdit()
      setOpen(false)
    } catch {
      toast.error("Error", {
        description: "Failed to update sale item. Please try again."
      })
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
              <p className="text-muted-foreground">
                Time remaining: {formatTimeLeft(timeLeft)}
              </p>
            ) : (
              <p className="text-red-500">
                This order cannot be edited as it was created more than 5 minutes ago
              </p>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid gap-4">
            {/* Product Selection */}
            <div className="grid gap-2">
              <Label htmlFor="product">Product</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                  >
                    {selectedProduct?.name || productName}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[300px]" align="start">
                  <div className="flex items-center border-b p-2">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 focus-visible:ring-0"
                    />
                  </div>
                  <div className="max-h-[300px] overflow-y-auto py-2">
                    {filteredProducts.length === 0 ? (
                      <div className="py-6 text-center text-sm">No products found.</div>
                    ) : (
                      filteredProducts.map((product) => (
                        <DropdownMenuItem
                          key={product.id}
                          onSelect={() => handleProductSelect(product)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {selectedProduct?.id === product.id && (
                              <Check className="h-4 w-4" />
                            )}
                            <span>{product.name}</span>
                          </div>
                          <span className={cn(
                            "text-xs",
                            product.stock === 0 ? "text-red-500" : "text-muted-foreground"
                          )}>
                            {product.stock === -1 ? "∞" : product.stock}
                          </span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Quantity Input */}
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
              disabled={
                isLoading || 
                !isEditable || 
                !selectedProduct || 
                (quantity === currentQuantity && selectedProduct.id === currentProductId)
              }
            >
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}