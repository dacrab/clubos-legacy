'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

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
        .lt("stock", 10)
        .eq("is_deleted", false)
        .order("stock", { ascending: true })

      if (data) {
        setProducts(data)
      }
    }

    fetchLowStockProducts()
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Low Stock Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {products.map((product) => (
            <div key={product.id} className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{product.name}</p>
                <p className="text-sm text-muted-foreground">
                  Stock: {product.stock} | Price: €{product.price.toFixed(2)}
                </p>
              </div>
              {product.stock === 0 && (
                <div className="ml-auto font-medium text-red-500">Out of stock</div>
              )}
              {product.stock > 0 && product.stock < 5 && (
                <div className="ml-auto font-medium text-orange-500">Critical</div>
              )}
              {product.stock >= 5 && (
                <div className="ml-auto font-medium text-yellow-500">Low</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 