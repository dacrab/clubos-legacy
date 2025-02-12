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
import { Pencil } from "lucide-react"
import { editSaleItem } from "@/app/dashboard/staff/actions"
import { useToast } from "@/components/ui/use-toast"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Check, ChevronsUpDown } from "lucide-react"

interface Product {
  id: string
  name: string
  price: number
}

interface EditSaleItemDialogProps {
  saleItemId: string
  productName: string
  currentQuantity: number
  currentProductId: string
  userId: string
  onEdit: () => void
}

export function EditSaleItemDialog({
  saleItemId,
  productName,
  currentQuantity,
  currentProductId,
  userId,
  onEdit
}: EditSaleItemDialogProps) {
  const [quantity, setQuantity] = useState(currentQuantity)
  const [selectedProductId, setSelectedProductId] = useState(currentProductId)
  const [products, setProducts] = useState<Product[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchProducts = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('products')
        .select('id, name, price')
        .eq('is_deleted', false)
        .order('name')

      if (data) {
        setProducts(data)
      }
    }

    if (isOpen) {
      fetchProducts()
    }
  }, [isOpen])

  const selectedProduct = products.find(product => product.id === selectedProductId)

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleProductSelect = (productName: string) => {
    const product = products.find(p => p.name === productName)
    if (product) {
      setSelectedProductId(product.id)
      setCommandOpen(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Only update if something has changed
    if (quantity === currentQuantity && selectedProductId === currentProductId) {
      setIsOpen(false)
      return
    }

    try {
      const result = await editSaleItem({
        saleItemId,
        quantity,
        productId: selectedProductId,
        userId
      })

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Sale item updated",
        description: "The sale item has been successfully updated."
      })
      
      onEdit()
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update sale item. Please try again.",
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
          className="h-8 w-8"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Sale Item</DialogTitle>
          <DialogDescription>
            Make changes to {productName}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Product</Label>
              <Popover open={commandOpen} onOpenChange={setCommandOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={commandOpen}
                    className="w-full justify-between"
                  >
                    {selectedProduct ? selectedProduct.name : productName}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-[300px]">
                  <Command>
                    <CommandInput 
                      placeholder="Search products..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>No products found.</CommandEmpty>
                      <CommandGroup>
                        {filteredProducts.map((product) => (
                          <CommandItem
                            key={product.id}
                            value={product.name}
                            onSelect={handleProductSelect}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedProductId === product.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {product.name}
                          </CommandItem>
                        ))}
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading || (quantity === currentQuantity && selectedProductId === currentProductId)}
            >
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}