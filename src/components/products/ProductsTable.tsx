'use client';

import { useState, useMemo, useRef } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { formatCurrency } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Product } from "@/types"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { ProductEditPanel } from "./ProductEditPanel"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image"

// Types
interface ProductsTableProps {
  products: Product[]
  categories: Array<{ id: string; name: string }>
  subcategories: Array<{ id: string; name: string; parent_id: string }>
}

interface StockStatus {
  label: string
  classes: string
}

// Component
export function ProductsTable({ products, categories, subcategories }: ProductsTableProps) {
  // State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSubcategory, setSelectedSubcategory] = useState("all")
  const tableRef = useRef<HTMLDivElement>(null)

  // Memoized values
  const categoryNames = useMemo(() => categories?.map(category => category.name) ?? [], [categories])
  const subcategoryNames = useMemo(() => subcategories?.map(subcategory => subcategory.name) ?? [], [subcategories])

  const filteredProducts = useMemo(() => {
    const searchLower = searchQuery.toLowerCase()
    return products.filter(product => {
      if (!product.name.toLowerCase().includes(searchLower)) return false
      if (selectedCategory !== "all" && product.category_id !== selectedCategory) return false
      if (selectedSubcategory !== "all" && product.subcategory_id !== selectedSubcategory) return false
      return true
    })
  }, [products, searchQuery, selectedCategory, selectedSubcategory])

  // Virtualizer setup
  const rowVirtualizer = useVirtualizer({
    count: filteredProducts.length,
    getScrollElement: () => tableRef.current,
    estimateSize: () => 56,
    overscan: 10
  })

  // Event handlers
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product)
    setIsEditPanelOpen(true)
  }

  const handleEditPanelClose = (open: boolean) => {
    setIsEditPanelOpen(open)
    if (!open) setSelectedProduct(null)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Helper functions
  const getStockStatus = (stock: number): StockStatus => {
    if (stock === -1) return { label: "Unlimited", classes: "bg-blue-100 text-blue-800" }
    if (stock === 0) return { label: "Out of Stock", classes: "bg-red-100 text-red-800" }
    if (stock < 10) return { label: "Low Stock", classes: "bg-yellow-100 text-yellow-800" }
    return { label: "In Stock", classes: "bg-green-100 text-green-800" }
  }

  const getCategoryName = (categoryId: string | null): string => {
    if (!categoryId) return ""
    return categories?.find(c => c.id === categoryId)?.name || ""
  }

  const getSubcategoryName = (subcategoryId: string | null): string => {
    if (!subcategoryId) return ""
    return subcategories?.find(s => s.id === subcategoryId)?.name || ""
  }

  // Render functions
  const renderTableHeader = () => (
    <div className="flex items-center py-4 px-4">
      <div className="w-[10%]">Image</div>
      <div className="w-[25%]">Name</div>
      <div className="w-[15%]">Category</div>
      <div className="w-[20%]">Subcategory</div>
      <div className="w-[10%]">Stock</div>
      <div className="w-[10%]">Price</div>
      <div className="w-[10%]">Status</div>
      <div className="w-[10%]">Actions</div>
    </div>
  )

  const renderProductRow = (product: Product, virtualRow: { size: number; start: number }) => {
    const stockStatus = getStockStatus(product.stock)
    
    return (
      <div
        key={product.id}
        className="absolute top-0 left-0 w-full border-b"
        style={{
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
        }}
      >
        <div className="flex h-14 items-center px-4">
          <div className="w-[10%]">
            {product.image_url ? (
              <div className="relative h-10 w-10">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="rounded-md object-cover"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-md bg-muted" />
            )}
          </div>
          <div className="w-[25%]">{product.name}</div>
          <div className="w-[15%]">{getCategoryName(product.category_id)}</div>
          <div className="w-[20%]">{getSubcategoryName(product.subcategory_id)}</div>
          <div className="w-[10%]">
            {product.stock === -1 ? <span className="text-blue-600">∞</span> : product.stock}
          </div>
          <div className="w-[10%]">{formatCurrency(product.price)}</div>
          <div className="w-[10%]">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${stockStatus.classes}`}>
              {stockStatus.label}
            </span>
          </div>
          <div className="w-[10%]">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(product)}
              aria-label="Edit product"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Fix subcategories filter
  const filteredSubcategories = useMemo(() => {
    if (selectedCategory === "all") return subcategories
    return subcategories.filter(sub => {
      const parentCategory = categories.find(cat => cat.id === selectedCategory)
      return parentCategory && sub.parent_id === parentCategory.id
    })
  }, [selectedCategory, subcategories, categories])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
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
              {filteredSubcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-md border">
          <div className="border-b">
            {renderTableHeader()}
          </div>
          <div
            ref={tableRef}
            className="h-[600px] overflow-auto"
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => 
                renderProductRow(filteredProducts[virtualRow.index], virtualRow)
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {selectedProduct && (
        <ProductEditPanel
          product={selectedProduct}
          open={isEditPanelOpen}
          onOpenChange={handleEditPanelClose}
          categories={categoryNames}
          subcategories={subcategoryNames}
        />
      )}
    </Card>
  )
}