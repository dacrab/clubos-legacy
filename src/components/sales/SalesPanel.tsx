'use client';

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Product } from "@/types"
import { CategorySelector } from "./CategorySelector"
import { ProductGrid } from "./ProductGrid"
import { OrderSummary } from "./OrderSummary"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface OrderItem extends Product {
  orderId: string
  is_treat_selected: boolean
}

interface SalesPanelProps {
  products: Product[] | null
  isOpen: boolean
  onClose: () => void
}

export function SalesPanel({ products, isOpen, onClose }: SalesPanelProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [couponsCount, setCouponsCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const categories = Array.from(new Set(products?.map(p => p.category) || []))
  
  const subcategories = Array.from(new Set(
    products
      ?.filter(p => !selectedCategory || p.category === selectedCategory)
      .map(p => p.subcategory)
      .filter((s): s is string => s !== null) || []
  ))

  const filteredProducts = products?.filter(product => 
    (!selectedCategory || product.category === selectedCategory) &&
    (!selectedSubcategory || product.subcategory === selectedSubcategory) &&
    !product.is_deleted
  ) || null

  const handleAddToOrder = (product: Product) => {
    const orderId = crypto.randomUUID()
    setOrderItems(prev => [...prev, { ...product, orderId, is_treat_selected: false }])
  }

  const handleRemoveItem = (orderId: string) => {
    setOrderItems(prev => prev.filter(item => item.orderId !== orderId))
  }

  const handleToggleTreat = (orderId: string) => {
    setOrderItems(prev => prev.map(item => 
      item.orderId === orderId 
        ? { ...item, is_treat_selected: !item.is_treat_selected }
        : item
    ))
  }

  const handleAddCoupon = () => setCouponsCount(prev => prev + 1)
  const handleRemoveCoupon = () => setCouponsCount(prev => Math.max(0, prev - 1))

  const handleCompleteSale = async () => {
    if (isProcessing || orderItems.length === 0) return
    setIsProcessing(true)

    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "You must be logged in to complete a sale.",
        })
        return
      }

      // Get or create register
      const { data: activeRegister } = await supabase
        .from("registers")
        .select("id, items_sold, coupons_used, treat_items_sold, total_amount")
        .is("closed_at", null)
        .limit(1)
        .single()

      const registerId = activeRegister?.id || (await supabase
        .from("registers")
        .insert({
          opened_at: new Date().toISOString(),
          items_sold: 0,
          coupons_used: 0,
          treat_items_sold: 0,
          total_amount: 0,
        })
        .select()
        .single())?.data?.id

      if (!registerId) throw new Error("Failed to get/create register")

      // Calculate totals
      const total = orderItems.reduce(
        (sum, item) => sum + (item.is_treat_selected ? 0 : item.price),
        0
      ) - (couponsCount * 2)

      // Create sale
      const { data: sale } = await supabase
        .from("sales")
        .insert({
          register_id: registerId,
          total_amount: Math.max(0, total),
          coupon_applied: couponsCount > 0,
          created_by: user.id,
        })
        .select()
        .single()

      if (!sale) throw new Error("Failed to create sale")

      // Create sale items
      const saleItems = orderItems.map(item => ({
        sale_id: sale.id,
        product_id: item.id,
        quantity: 1,
        price_at_sale: item.is_treat_selected ? 0 : item.price,
        is_treat: item.is_treat_selected,
      }))

      await supabase.from("sale_items").insert(saleItems)

      // Update register
      const treatsCount = orderItems.filter(item => item.is_treat_selected).length
      await supabase
        .from("registers")
        .update({
          items_sold: (activeRegister?.items_sold || 0) + orderItems.length,
          coupons_used: (activeRegister?.coupons_used || 0) + couponsCount,
          treat_items_sold: (activeRegister?.treat_items_sold || 0) + treatsCount,
          total_amount: (activeRegister?.total_amount || 0) + Math.max(0, total),
          updated_at: new Date().toISOString()
        })
        .eq("id", registerId)

      // Update stock
      for (const item of orderItems) {
        try {
          console.log(`Attempting to update stock for product ${item.name} (${item.id})`)
          
          // Get current stock
          const { data: product, error: stockCheckError } = await supabase
            .from("products")
            .select("id, stock, name")
            .eq("id", item.id)
            .single()

          if (stockCheckError) {
            console.error("Stock check error:", stockCheckError)
            toast({
              variant: "destructive",
              title: "Warning",
              description: `Failed to check stock for ${item.name}. Please verify manually.`,
            })
            continue
          }

          if (!product) {
            console.error("Product not found:", item.id)
            toast({
              variant: "destructive",
              title: "Warning",
              description: `Product ${item.name} not found.`,
            })
            continue
          }

          console.log(`Current stock for ${product.name}: ${product.stock}`)

          // Get user role before update
          const { data: { user } } = await supabase.auth.getUser()
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user?.id)
            .single()

          console.log(`Attempting update as user role: ${profile?.role}`)

          // Update stock
          const { data: updateData, error: updateError } = await supabase
            .from("products")
            .update({
              stock: Math.max(0, product.stock - 1)
            })
            .eq("id", item.id)
            .select()

          if (updateError) {
            console.error("Stock update error details:", {
              error: updateError,
              productId: item.id,
              currentStock: product.stock,
              userRole: profile?.role
            })
            toast({
              variant: "destructive",
              title: "Warning",
              description: `Failed to update stock for ${item.name}. Error: ${updateError.message}`,
            })
          } else {
            console.log(`Successfully updated stock for ${product.name} to ${Math.max(0, product.stock - 1)}`)
          }
        } catch (error) {
          console.error("Stock update failed:", error)
          toast({
            variant: "destructive",
            title: "Warning",
            description: `Error updating stock. Please verify inventory manually.`,
          })
        }
      }

      toast({ title: "Success", description: "Sale completed successfully." })
      setOrderItems([])
      setCouponsCount(0)
      router.refresh()

    } catch (error) {
      console.error("Sale error:", error)
      toast({
        variant: "destructive",
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to complete sale."
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const orderItemsForSummary = orderItems.map(({ id, orderId, name, price, is_treat_selected }) => ({
    id,
    orderId,
    name, 
    price,
    is_treat_selected,
  }))

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh] flex flex-col p-8">
        <DialogHeader className="mb-5">
          <DialogTitle className="text-2xl">New Sale</DialogTitle>
          <DialogDescription className="text-base">
            Create a new sale by selecting products from the catalog
          </DialogDescription>
        </DialogHeader>
        <div className="grid flex-1 grid-cols-12 gap-6 overflow-hidden">
          <div className="col-span-2 overflow-auto rounded-lg border bg-card">
            <CategorySelector
              categories={categories}
              subcategories={subcategories}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onSelectCategory={setSelectedCategory}
              onSelectSubcategory={setSelectedSubcategory}
            />
          </div>

          <div className="col-span-7 overflow-auto rounded-lg border bg-card">
            <ProductGrid
              products={filteredProducts}
              onAddToOrder={handleAddToOrder}
            />
          </div>

          <div className="col-span-3 overflow-auto rounded-lg border bg-card">
            <OrderSummary
              items={orderItemsForSummary}
              couponsCount={couponsCount}
              onRemoveItem={handleRemoveItem}
              onToggleTreat={handleToggleTreat}
              onAddCoupon={handleAddCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              onCompleteSale={handleCompleteSale}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}