'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  name: string
  stock: number
  price: number
}

export function LowStockProducts() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchLowStockProducts = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("products")
        .select("id, name, stock, price")
        .gt("stock", -1)
        .lt("stock", 10)
        .eq("is_deleted", false)
        .order("stock", { ascending: true })

      if (data) {
        setProducts(data)
      }
    }

    fetchLowStockProducts()

    // Set up real-time subscription for stock updates
    const supabase = createClient()
    const channel = supabase
      .channel('low-stock-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: 'stock<10 AND stock>-1 AND is_deleted=false'
        },
        () => {
          fetchLowStockProducts()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (!products.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Low Stock Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No products with low stock</p>
        </CardContent>
      </Card>
    )
  }

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: "Out of stock", color: "text-red-500" }
    if (stock < 5) return { label: "Critical", color: "text-orange-500" }
    return { label: "Low", color: "text-yellow-500" }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {products.map((product) => {
            const status = getStockStatus(product.stock)
            
            return (
              <div key={product.id} className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Stock: {product.stock} | Price: {formatCurrency(product.price)}
                  </p>
                </div>
                <div className={`ml-auto font-medium ${status.color}`}>
                  {status.label}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 