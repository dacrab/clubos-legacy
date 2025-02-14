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
import { Edit, Search } from "lucide-react"
import Image from "next/image"
import { ProductEditPanel } from "./ProductEditPanel"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ProductsTableProps {
  products: Product[] | null
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all")

  if (!products?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No products found</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const categories = [...new Set(products.map(p => p.category))]
  
  const subcategories = [...new Set(
    products
      .filter(p => selectedCategory === "all" || p.category === selectedCategory)
      .map(p => p.subcategory)
      .filter((subcategory): subcategory is string => subcategory !== null)
  )]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    const matchesSubcategory = selectedSubcategory === "all" || product.subcategory === selectedSubcategory
    return matchesSearch && matchesCategory && matchesSubcategory
  })

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product)
    setIsEditPanelOpen(true)
  }

  const handleEditPanelClose = (open: boolean) => {
    setIsEditPanelOpen(open)
    if (!open) setSelectedProduct(null)
  }

  const getStockStatus = (stock: number) => {
    if (stock === -1) return { label: "Unlimited", classes: "bg-blue-100 text-blue-800" }
    if (stock === 0) return { label: "Out of Stock", classes: "bg-red-100 text-red-800" }
    if (stock < 10) return { label: "Low Stock", classes: "bg-yellow-100 text-yellow-800" }
    return { label: "In Stock", classes: "bg-green-100 text-green-800" }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-4">
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value)
                  setSelectedSubcategory("all")
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedSubcategory}
                onValueChange={setSelectedSubcategory}
                disabled={selectedCategory === "all"}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subcategories</SelectItem>
                  {subcategories.map((subcategory) => (
                    <SelectItem key={subcategory} value={subcategory}>
                      {subcategory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium">Image</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Category</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Stock</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Price</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock)
                  
                  return (
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
                              <span className="text-xs text-muted-foreground">No img</span>
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
                      <td className="p-4 align-middle">
                        {product.stock === -1 ? (
                          <span className="text-blue-600">∞</span>
                        ) : (
                          product.stock
                        )}
                      </td>
                      <td className="p-4 align-middle">{formatCurrency(product.price)}</td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${stockStatus.classes}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(product)}
                            aria-label="Edit product"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedProduct && (
        <ProductEditPanel
          product={selectedProduct}
          open={isEditPanelOpen}
          onOpenChange={handleEditPanelClose}
          categories={categories}
          subcategories={subcategories}
        />
      )}
    </>
  )
}