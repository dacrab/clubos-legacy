'use client';

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Product } from "@/types"
import { CategorySelector } from "./CategorySelector"
import { ProductGrid } from "./ProductGrid"
import { OrderSummary } from "./OrderSummary"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [couponsCount, setCouponsCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // Get unique categories
  const categories = products
    ?.filter(p => p.category && p.category_id)
    .reduce<Array<{ id: string; name: string }>>((acc, product) => {
      if (!acc.some(c => c.id === product.category_id) && product.category) {
        acc.push({
          id: product.category_id!,
          name: product.category.name
        });
      }
      return acc;
    }, [])
    .sort((a, b) => a.name.localeCompare(b.name)) || [];

  // Get unique subcategories for the selected category
  const subcategories = products
    ?.filter(p => 
      p.subcategory && 
      p.subcategory_id && 
      (!selectedCategory || p.category_id === selectedCategory)
    )
    .reduce<Array<{ id: string; name: string }>>((acc, product) => {
      if (!acc.some(s => s.id === product.subcategory_id) && product.subcategory) {
        acc.push({
          id: product.subcategory_id!,
          name: product.subcategory.name
        });
      }
      return acc;
    }, [])
    .sort((a, b) => a.name.localeCompare(b.name)) || [];

  const filteredProducts = products?.filter(product => 
    (!selectedCategory || product.category_id === selectedCategory) &&
    (!selectedSubcategory || product.subcategory_id === selectedSubcategory) &&
    !product.is_deleted
  ) || null;

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
        toast.error("Error", {
          description: "You must be logged in to complete a sale."
        })
        setIsProcessing(false)
        return
      }

      // Get or create register
      const { data: activeRegister, error: registerError } = await supabase
        .from("registers")
        .select("id, items_sold, coupons_used, treat_items_sold, total_amount")
        .is("closed_at", null)
        .limit(1)
        .single()

      if (registerError && registerError.code !== 'PGRST116') {
        throw new Error(`Failed to get register: ${registerError.message}`)
      }

      const { data: newRegister, error: createRegisterError } = !activeRegister 
        ? await supabase
            .from("registers")
            .insert({
              opened_at: new Date().toISOString(),
              items_sold: 0,
              coupons_used: 0,
              treat_items_sold: 0,
              total_amount: 0
            })
            .select()
            .single()
        : { data: null, error: null }

      if (createRegisterError) {
        throw new Error(`Failed to create register: ${createRegisterError.message}`)
      }

      const registerId = activeRegister?.id || newRegister?.id

      if (!registerId) {
        throw new Error("Failed to get/create register")
      }

      // Calculate totals
      const total = orderItems.reduce(
        (sum, item) => sum + (item.is_treat_selected ? 0 : item.price),
        0
      ) - (couponsCount * 2)

      const now = new Date().toISOString()

      // Create sale
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          register_id: registerId,
          total_amount: Math.max(0, total),
          coupon_applied: couponsCount > 0,
          coupons_used: couponsCount,
          created_by: user.id,
          created_at: now,
          updated_at: now,
          is_treat: orderItems.some(item => item.is_treat_selected)
        })
        .select()
        .single()

      if (saleError) throw new Error(`Failed to create sale: ${saleError.message}`)
      if (!sale) throw new Error("Failed to create sale: No sale was created")

      // Create sale items
      const saleItems = orderItems.map(item => ({
        sale_id: sale.id,
        product_id: item.id,
        quantity: 1,
        price_at_sale: item.is_treat_selected ? 0 : item.price,
        is_treat: item.is_treat_selected,
        created_at: now,
        is_deleted: false
      }))

      const { error: saleItemsError } = await supabase
        .from("sale_items")
        .insert(saleItems)

      if (saleItemsError) {
        // Rollback sale if sale items creation fails
        await supabase.from("sales").delete().eq("id", sale.id)
        throw new Error(`Failed to create sale items: ${saleItemsError.message}`)
      }

      // Update register
      const treatsCount = orderItems.filter(item => item.is_treat_selected).length
      const { error: registerUpdateError } = await supabase
        .from("registers")
        .update({
          items_sold: (activeRegister?.items_sold || 0) + orderItems.length,
          coupons_used: (activeRegister?.coupons_used || 0) + couponsCount,
          treat_items_sold: (activeRegister?.treat_items_sold || 0) + treatsCount,
          total_amount: (activeRegister?.total_amount || 0) + Math.max(0, total),
          updated_at: now
        })
        .eq("id", registerId)

      if (registerUpdateError) {
        throw new Error(`Failed to update register: ${registerUpdateError.message}`)
      }

      // Update stock
      for (const item of orderItems) {
        if (item.stock === -1) continue // Skip unlimited stock items

        const { data: product, error: stockCheckError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single()

        if (stockCheckError) {
          console.error(`Failed to check stock for product ${item.id}:`, stockCheckError)
          continue
        }

        if (!product) {
          console.error(`Product not found: ${item.id}`)
          continue
        }

        const { error: updateError } = await supabase
          .from("products")
          .update({
            stock: product.stock === -1 ? -1 : Math.max(0, product.stock - 1),
            updated_at: now
          })
          .eq("id", item.id)

        if (updateError) {
          console.error(`Failed to update stock for product ${item.id}:`, updateError)
        }
      }

      toast.success("Success", { 
        description: "Sale completed successfully." 
      })
      setOrderItems([])
      setCouponsCount(0)
      router.refresh()

    } catch (error) {
      console.error("Sale error:", error)
      toast.error("Error", {
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