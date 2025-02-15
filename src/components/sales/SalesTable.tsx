'use client';

import React from "react"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Sale } from "@/types"
import { 
  Gift, 
  Ticket, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  User,
  ShoppingCart,
  DollarSign,
  Info,
  ChevronRight
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface SalesTableProps {
  sales: Sale[] | null
}

interface ProductSummary {
  name: string
  quantity: number
  price: number
  total: number
  is_treat: boolean
  is_edited: boolean
  is_deleted: boolean
}

const TotalDisplay = ({ totalAmount, couponsUsed }: { totalAmount: number, couponsUsed: number }) => {
  const subtotal = totalAmount
  const couponDiscount = couponsUsed * 2
  const finalTotal = subtotal - couponDiscount

  if (!couponsUsed) {
    return <span className="font-medium">Total: {formatCurrency(totalAmount)}</span>
  }

  return (
    <>
      <div className="text-sm">Subtotal: {formatCurrency(subtotal)}</div>
      <div className="text-sm text-red-600">
        Coupon discount: -{formatCurrency(couponDiscount)}
      </div>
      <div className="font-medium">Final total: {formatCurrency(finalTotal)}</div>
    </>
  )
}

const StatusBadge = ({ type, children }: { type: 'sale' | 'treat' | 'edited' | 'deleted', children: React.ReactNode }) => {
  const styles = {
    sale: "bg-green-100 text-green-800",
    treat: "bg-pink-100 text-pink-800",
    edited: "bg-yellow-100 text-yellow-800",
    deleted: "bg-red-100 text-red-800"
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${styles[type]}`}>
      {children}
    </span>
  )
}

const SaleStatusIcons = ({ sale }: { sale: Sale }) => (
  <div className="flex flex-col gap-2">
    {sale.coupon_applied && (
      <div className="flex items-center gap-1">
        <Ticket className="h-4 w-4 text-blue-500" />
        <span className="text-xs text-muted-foreground">
          {sale.coupons_used} Coupon{sale.coupons_used !== 1 ? 's' : ''} Used
        </span>
      </div>
    )}
    {sale.sale_items.some(item => item.is_treat) && (
      <div className="flex items-center gap-1">
        <Gift className="h-4 w-4 text-pink-500" />
        <span className="text-xs text-muted-foreground">
          {sale.sale_items.filter(item => item.is_treat).length} Treat{sale.sale_items.filter(item => item.is_treat).length !== 1 ? 's' : ''}
        </span>
      </div>
    )}
  </div>
)

const ProductRow = ({ product }: { product: ProductSummary }) => (
  <tr>
    <td className="py-2">{product.name}</td>
    <td className="py-2">{product.quantity}</td>
    <td className="py-2">{formatCurrency(product.price)}</td>
    <td className="py-2">{formatCurrency(product.total)}</td>
    <td className="py-2">
      {product.is_treat ? (
        <StatusBadge type="treat"><Gift className="h-3 w-3" />Treat</StatusBadge>
      ) : (
        <StatusBadge type="sale"><ShoppingCart className="h-3 w-3" />Sale</StatusBadge>
      )}
    </td>
    <td className="py-2">
      <div className="flex gap-1">
        {product.is_edited && <StatusBadge type="edited">Edited</StatusBadge>}
        {product.is_deleted && <StatusBadge type="deleted">Deleted</StatusBadge>}
      </div>
    </td>
  </tr>
)

const SaleDetails = ({ sale, productSummary }: { sale: Sale, productSummary: ProductSummary[] }) => (
  <div className="rounded-lg border bg-muted/50 p-4">
    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left font-medium">Product</th>
          <th className="text-left font-medium">Quantity</th>
          <th className="text-left font-medium">Price</th>
          <th className="text-left font-medium">Total</th>
          <th className="text-left font-medium">Type</th>
          <th className="text-left font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        {productSummary.map((product, index) => (
          <ProductRow key={`${sale.id}-${index}`} product={product} />
        ))}
        <tr className="border-t">
          <td colSpan={3} className="py-2 font-bold text-right">Summary:</td>
          <td colSpan={3} className="py-2">
            <div className="flex flex-col gap-1">
              <TotalDisplay totalAmount={sale.total_amount} couponsUsed={sale.coupons_used} />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)

export function SalesTable({ sales }: SalesTableProps) {
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set())

  if (!sales?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No sales found</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const handleToggleSale = (saleId: string) => {
    setExpandedSales(prev => {
      const next = new Set(prev)
      if (next.has(saleId)) {
        next.delete(saleId)
      } else {
        next.add(saleId)
      }
      return next
    })
  }

  const getProductSummary = (sale: Sale): ProductSummary[] => {
    const productMap = new Map<string, ProductSummary>()

    sale.sale_items.forEach(item => {
      const key = `${item.products.name}-${item.is_deleted ? 'deleted' : 'active'}`
      const existing = productMap.get(key)
      const total = item.price_at_sale * item.quantity

      const isEdited = Boolean(item.last_edited_by)
      const isDeleted = Boolean(item.is_deleted)

      if (existing) {
        existing.quantity += item.quantity
        existing.total += total
        existing.is_edited = existing.is_edited || isEdited
        existing.is_deleted = existing.is_deleted || isDeleted
      } else {
        productMap.set(key, {
          name: item.products.name,
          quantity: item.quantity,
          price: item.price_at_sale,
          total,
          is_treat: item.is_treat,
          is_edited: isEdited,
          is_deleted: isDeleted
        })
      }
    })

    return Array.from(productMap.values())
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales ({sales.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <Calendar className="h-4 w-4 inline mr-2" />Date
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <User className="h-4 w-4 inline mr-2" />Staff
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <ShoppingCart className="h-4 w-4 inline mr-2" />Items Count
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <DollarSign className="h-4 w-4 inline mr-2" />Total
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <Info className="h-4 w-4 inline mr-2" />Status
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <ChevronRight className="h-4 w-4 inline mr-2" />Details
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {sales.map((sale) => {
                const isExpanded = expandedSales.has(sale.id)
                const productSummary = getProductSummary(sale)
                
                return (
                  <React.Fragment key={sale.id}>
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle">{formatDate(new Date(sale.created_at))}</td>
                      <td className="p-4 align-middle">{sale.profile.name}</td>
                      <td className="p-4 align-middle">
                        {sale.sale_items.reduce((sum, item) => sum + item.quantity, 0)}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col gap-1">
                          <TotalDisplay 
                            totalAmount={sale.total_amount} 
                            couponsUsed={sale.coupon_applied ? sale.coupons_used : 0} 
                          />
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <SaleStatusIcons sale={sale} />
                      </td>
                      <td className="p-4 align-middle">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSale(sale.id)}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="p-4">
                          <SaleDetails sale={sale} productSummary={productSummary} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}