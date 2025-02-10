'use client';

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Product } from "@/types"
import { CategorySelector } from "./CategorySelector"
import { ProductGrid } from "./ProductGrid"
import { OrderSummary } from "./OrderSummary"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"

interface OrderItem extends Product {
  orderId: string
  is_treat_selected: boolean
}

interface SalesPanelProps {
  products: Product[] | null
}

export function SalesPanel({ products }: SalesPanelProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [couponsCount, setCouponsCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const categories = products
    ? Array.from(new Set(products.map((product) => product.category)))
    : []

  const subcategories = products
    ? Array.from(
        new Set(
          products
            .filter(
              (product) =>
                !selectedCategory || product.category === selectedCategory
            )
            .map((product) => product.subcategory)
            .filter((subcategory): subcategory is string => subcategory !== null)
        )
      )
    : []

  const filteredProducts = products?.filter(
    (product) =>
      (!selectedCategory || product.category === selectedCategory) &&
      (!selectedSubcategory || product.subcategory === selectedSubcategory) &&
      !product.is_deleted
  ) || null

  const handleAddToOrder = (product: Product) => {
    const orderId = crypto.randomUUID()
    setOrderItems((prev) => [
      ...prev,
      { ...product, orderId, is_treat_selected: false }
    ])
  }

  const handleRemoveItem = (orderId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.orderId !== orderId))
  }

  const handleToggleTreat = (orderId: string) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.orderId === orderId
          ? { ...item, is_treat_selected: !item.is_treat_selected }
          : item
      )
    )
  }

  const handleAddCoupon = () => {
    setCouponsCount((prev) => prev + 1)
  }

  const handleRemoveCoupon = () => {
    setCouponsCount((prev) => Math.max(0, prev - 1))
  }

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

      // Get or create an active register
      const { data: activeRegister, error: registerError } = await supabase
        .from("registers")
        .select("id, items_sold, coupons_used, treat_items_sold, total_amount")
        .is("closed_at", null)
        .limit(1)
        .single()

      let registerId: string

      if (registerError || !activeRegister) {
        // Create a new register if none is active
        const { data: newRegister, error: createRegisterError } = await supabase
          .from("registers")
          .insert({
            opened_at: new Date().toISOString(),
            items_sold: 0,
            coupons_used: 0,
            treat_items_sold: 0,
            total_amount: 0,
          })
          .select()
          .single()

        if (createRegisterError || !newRegister) {
          console.error("Register creation error:", createRegisterError)
          throw new Error("Failed to create a new register")
        }

        registerId = newRegister.id
      } else {
        registerId = activeRegister.id
      }

      // Calculate total amount
      const total = orderItems.reduce(
        (sum, item) => sum + (item.is_treat_selected ? 0 : item.price),
        0
      ) - (couponsCount * 2)

      // Create the sale record with register_id
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          register_id: registerId,
          total_amount: Math.max(0, total),
          coupon_applied: couponsCount > 0,
          created_by: user.id,
        })
        .select()
        .single()

      if (saleError) {
        console.error("Sale creation error:", saleError)
        throw new Error("Failed to create sale record")
      }

      if (!sale) {
        throw new Error("Sale record was not created")
      }

      // Insert sale items
      const saleItems = orderItems.map((item) => ({
        sale_id: sale.id,
        product_id: item.id,
        quantity: 1,
        price_at_sale: item.is_treat_selected ? 0 : item.price,
        is_treat: item.is_treat_selected,
      }))

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(saleItems)

      if (itemsError) {
        console.error("Sale items error:", itemsError)
        // Attempt to rollback the sale
        await supabase
          .from("sales")
          .delete()
          .eq("id", sale.id)
        throw new Error("Failed to create sale items")
      }

      // Update register totals
      const { error: registerUpdateError } = await supabase
        .from("registers")
        .update({
          items_sold: activeRegister ? activeRegister.items_sold + orderItems.length : orderItems.length,
          coupons_used: activeRegister ? activeRegister.coupons_used + couponsCount : couponsCount,
          treat_items_sold: activeRegister ? 
            activeRegister.treat_items_sold + orderItems.filter(item => item.is_treat_selected).length :
            orderItems.filter(item => item.is_treat_selected).length,
          total_amount: activeRegister ? 
            activeRegister.total_amount + Math.max(0, total) :
            Math.max(0, total),
          updated_at: new Date().toISOString()
        })
        .eq("id", registerId)

      if (registerUpdateError) {
        console.error("Register update error:", registerUpdateError)
        throw new Error("Failed to update register totals")
      }

      // Update product stock levels
      for (const item of orderItems) {
        const { error: stockError } = await supabase
          .from("products")
          .update({ 
            stock: item.stock - 1,
            updated_at: new Date().toISOString()
          })
          .eq("id", item.id)
          .gt("stock", 0) // Ensure stock is greater than 0

        if (stockError) {
          console.error("Stock update error:", stockError)
          throw new Error(`Failed to update stock for product: ${item.name}`)
        }
      }

      toast({
        title: "Sale completed",
        description: "The sale has been successfully processed.",
      })

      // Reset the order
      setOrderItems([])
      setCouponsCount(0)
      router.refresh()
    } catch (error) {
      console.error("Sale error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete the sale. Please try again.",
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
    <div className="grid h-[calc(100vh-10rem)] grid-cols-12 gap-4">
      {/* Categories Section */}
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

      {/* Products Grid */}
      <div className="col-span-7 overflow-auto rounded-lg border bg-card">
        <ProductGrid
          products={filteredProducts}
          onAddToOrder={handleAddToOrder}
        />
      </div>

      {/* Order Summary */}
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
  )
} 