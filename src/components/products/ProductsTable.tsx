'use client';

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ProductEditPanel } from "./ProductEditPanel"

interface ProductsTableProps {
  products: Product[] | null
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false)

  if (!products?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No products found</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  // Get unique categories and subcategories for the edit panel
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  )
  const subcategories = Array.from(
    new Set(
      products
        .map((product) => product.subcategory)
        .filter((subcategory): subcategory is string => subcategory !== null)
    )
  )

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Products ({products.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Image
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Name
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Category
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Stock
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Price
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Status
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle">
                      <div className="relative h-10 w-10">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="rounded-md object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                            <span className="text-xs text-muted-foreground">
                              No img
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span className="font-medium">{product.name}</span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col">
                        <span className="font-medium">{product.category}</span>
                        {product.subcategory && (
                          <span className="text-xs text-muted-foreground">
                            {product.subcategory}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">{product.stock}</td>
                    <td className="p-4 align-middle">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="p-4 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.stock === 0
                            ? "bg-red-100 text-red-800"
                            : product.stock < 10
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {product.stock === 0
                          ? "Out of Stock"
                          : product.stock < 10
                          ? "Low Stock"
                          : "In Stock"}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedProduct(product)
                            setIsEditPanelOpen(true)
                          }}
                          aria-label="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedProduct && (
        <ProductEditPanel
          product={selectedProduct}
          open={isEditPanelOpen}
          onOpenChange={(open) => {
            setIsEditPanelOpen(open)
            if (!open) setSelectedProduct(null)
          }}
          categories={categories}
          subcategories={subcategories}
        />
      )}
    </>
  )
}