'use client'

import { formatDistanceToNow } from "date-fns"
import { ChevronDown, ChevronUp, Gift, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
import React from "react"
import { EditSaleItemDialog } from "@/components/sales/EditSaleItemDialog"
import { DeleteSaleItemDialog } from "@/components/sales/DeleteProductDialog"
import { cn } from "@/lib/utils"

interface Product {
  id: string
  name: string
  is_deleted: boolean
}

interface SaleItem {
  id: string
  quantity: number
  price_at_sale: number
  products: Product
  is_treat?: boolean
  last_edited_by?: string | null
  last_edited_at?: string | null
  is_deleted?: boolean
  deleted_by?: string | null
  deleted_at?: string | null
}

interface Sale {
  id: string
  created_at: string
  profile: {
    name: string
  }
  sale_items: SaleItem[]
  total_amount: number
  is_treat: boolean
  coupon_applied: boolean
}

interface RecentSalesProps {
  sales: Sale[] | null
  showEditStatus?: boolean
  userId: string
}

export function RecentSales({ sales, showEditStatus = true, userId }: RecentSalesProps) {
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set())
  const [refreshKey, setRefreshKey] = useState(0)

  if (!sales?.length) {
    return (
      <div className="flex h-[450px] items-center justify-center">
        <p className="text-sm text-muted-foreground">No recent sales found</p>
      </div>
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

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const getTreatItems = (sale: Sale) => sale.sale_items.filter(item => sale.is_treat)
  const getNormalItems = (sale: Sale) => sale.sale_items.filter(item => !sale.is_treat)

  const renderSaleItem = (item: SaleItem, index: number, isTreat: boolean = false) => {
    const total = isTreat ? 0 : item.price_at_sale * item.quantity
    const isEdited = showEditStatus && item.last_edited_by
    const isDeleted = showEditStatus && item.is_deleted
    
    return (
      <tr key={`${isTreat ? 'treat' : 'item'}-${index}`} className={cn(
        isTreat ? "text-sm" : "",
        isDeleted ? "opacity-50" : ""
      )}>
        <td className="py-2">{item.products.name}</td>
        <td className="py-2">{item.quantity}</td>
        <td className="py-2">€{isTreat ? '0.00' : item.price_at_sale.toFixed(2)}</td>
        <td className="py-2">€{total.toFixed(2)}</td>
        <td className="py-2">
          <div className="flex items-center gap-2">
            {!isTreat && !isDeleted && (
              <>
                <EditSaleItemDialog
                  saleItemId={item.id}
                  productName={item.products.name}
                  currentQuantity={item.quantity}
                  currentProductId={item.products.id}
                  userId={userId}
                  onEdit={handleRefresh}
                />
                <DeleteSaleItemDialog
                  saleItemId={item.id}
                  productName={item.products.name}
                  userId={userId}
                  onDelete={handleRefresh}
                />
              </>
            )}
            {isTreat && (
              <div className="flex items-center gap-1 text-pink-800">
                <Gift className="h-4 w-4" />
              </div>
            )}
            {isEdited && (
              <div className="flex items-center gap-1 text-yellow-600" title="This item was edited">
                <Pencil className="h-3 w-3" />
              </div>
            )}
            {isDeleted && (
              <div className="flex items-center gap-1 text-red-600" title="This item was deleted">
                <Trash2 className="h-3 w-3" />
              </div>
            )}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">Order #</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Time</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Seller</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Total</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {sales.map((sale) => {
                const isExpanded = expandedSales.has(sale.id)
                const treatItems = getTreatItems(sale)
                const normalItems = getNormalItems(sale)

                return (
                  <React.Fragment key={`${sale.id}-${refreshKey}`}>
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">
                        #{sale.id.slice(-4)}
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {formatDistanceToNow(new Date(sale.created_at), { addSuffix: true })}
                      </td>
                      <td className="p-4 align-middle">{sale.profile.name}</td>
                      <td className="p-4 align-middle font-medium">
                        €{sale.total_amount.toFixed(2)}
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
                        <td colSpan={5} className="p-4">
                          <div className="rounded-lg border bg-muted/50 p-4">
                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className="text-left font-medium">Product</th>
                                  <th className="text-left font-medium">Quantity</th>
                                  <th className="text-left font-medium">Price</th>
                                  <th className="text-left font-medium">Total</th>
                                  <th className="text-left font-medium">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {normalItems.map((item, index) => renderSaleItem(item, index))}

                                {treatItems.length > 0 && (
                                  <>
                                    <tr>
                                      <td colSpan={5} className="pt-4 pb-2">
                                        <div className="flex items-center gap-2">
                                          <Gift className="h-4 w-4 text-pink-500" />
                                          <span className="font-semibold text-pink-800">
                                            Treats
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                    {treatItems.map((item, index) => renderSaleItem(item, index, true))}
                                  </>
                                )}

                                <tr className="border-t">
                                  <td colSpan={3} className="py-2 text-right font-bold">
                                    Total Amount:
                                  </td>
                                  <td colSpan={2} className="py-2 font-bold">
                                    €{sale.total_amount.toFixed(2)}
                                  </td>
                                </tr>
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