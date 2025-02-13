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
import { Gift, Ticket, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface SalesTableProps {
  sales: Sale[] | null
}

interface ProductSummary {
  name: string
  quantity: number
  is_treat: boolean
  is_edited: boolean
  is_deleted: boolean
}

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
      const existing = productMap.get(item.products.name)
      if (existing) {
        existing.quantity += item.quantity
        existing.is_edited = existing.is_edited || Boolean(item.products.last_edited_by)
        existing.is_deleted = existing.is_deleted || Boolean(item.products.is_deleted)
      } else {
        productMap.set(item.products.name, {
          name: item.products.name,
          quantity: item.quantity,
          is_treat: item.is_treat,
          is_edited: Boolean(item.products.last_edited_by),
          is_deleted: Boolean(item.products.is_deleted)
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
                <th className="h-12 px-4 text-left align-middle font-medium">Date</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Staff</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Items Count</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Total</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {sales.map((sale) => {
                const isExpanded = expandedSales.has(sale.id)
                const productSummary = getProductSummary(sale)
                
                return (
                  <React.Fragment key={sale.id}>
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle">
                        {formatDate(new Date(sale.created_at))}
                      </td>
                      <td className="p-4 align-middle">
                        {sale.profile.name}
                      </td>
                      <td className="p-4 align-middle">
                        {sale.sale_items.reduce((sum, item) => sum + item.quantity, 0)}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col gap-1">
                          {sale.coupon_applied ? (
                            <>
                              <div className="text-sm text-muted-foreground line-through">
                                Subtotal: {formatCurrency(sale.total_amount + (sale.coupons_used * 2))}
                              </div>
                              <div className="text-sm text-red-600">
                                Coupon discount: -{formatCurrency(sale.coupons_used * 2)}
                              </div>
                              <div className="font-medium">
                                Final total: {formatCurrency(sale.total_amount)}
                              </div>
                            </>
                          ) : (
                            <span className="font-medium">
                              Total: {formatCurrency(sale.total_amount)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
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
                      </td>
                      <td className="p-4 align-middle">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSale(sale.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={6} className="p-4">
                          <div className="rounded-lg border bg-muted/50 p-4">
                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className="text-left font-medium">Product</th>
                                  <th className="text-left font-medium">Quantity</th>
                                  <th className="text-left font-medium">Type</th>
                                  <th className="text-left font-medium">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {productSummary.map((product, index) => (
                                  <tr key={`${sale.id}-${index}`}>
                                    <td className="py-2">{product.name}</td>
                                    <td className="py-2">{product.quantity}</td>
                                    <td className="py-2">
                                      {product.is_treat ? (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-800">
                                          <Gift className="h-3 w-3" />
                                          Treat
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                          Sale
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2">
                                      <div className="flex gap-1">
                                        {product.is_edited && (
                                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                            Edited
                                          </span>
                                        )}
                                        {product.is_deleted && (
                                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                            Deleted
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
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