'use client'

import { formatDistanceToNow } from "date-fns"
import { ChevronDown, ChevronUp, Gift, Pencil, Trash2, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"
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
  is_treat: boolean
  marked_as_treat_by?: string | null
  marked_as_treat_at?: string | null
  last_edited_by?: string | null
  last_edited_at?: string | null
  is_deleted?: boolean
  deleted_by?: string | null
  deleted_at?: string | null
  created_at: string
}

interface Sale {
  id: string
  created_at: string
  profile: {
    name: string
  }
  sale_items: SaleItem[]
  total_amount: number
  coupons_count: number
  coupon_applied: boolean
}

interface RecentSalesProps {
  sales: Sale[] | null
  showEditStatus?: boolean
  userId: string
}

export function RecentSales({ sales, userId }: RecentSalesProps) {
  const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set())
  const [refreshKey, setRefreshKey] = useState(0)

  if (!sales?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent sales found</p>
        </CardContent>
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

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  const getTreatItems = (sale: Sale) => sale.sale_items.filter(item => item.is_treat)
  const getNormalItems = (sale: Sale) => sale.sale_items.filter(item => !item.is_treat)

  const renderSaleHeader = (sale: Sale, isExpanded: boolean) => {
    const treatItems = getTreatItems(sale)
    return (
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium leading-none">
              Order #{sale.id.slice(-4)}
            </p>
            {sale.coupon_applied && (
              <div className="flex items-center gap-1 text-emerald-600" title={`${sale.coupons_count} Coupon${sale.coupons_count > 1 ? 's' : ''} Applied (€${(sale.coupons_count * 2).toFixed(2)})`}>
                <Ticket className="h-4 w-4" />
                <span className="text-xs">x{sale.coupons_count}</span>
              </div>
            )}
            {treatItems.length > 0 && (
              <div className="flex items-center gap-1 text-pink-600" title={`${treatItems.length} Treat Item${treatItems.length > 1 ? 's' : ''}`}>
                <Gift className="h-4 w-4" />
                <span className="text-xs">x{treatItems.length}</span>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(sale.created_at), { addSuffix: true })} by {sale.profile.name}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium">€{sale.total_amount.toFixed(2)}</p>
            {sale.coupon_applied && (
              <p className="text-xs text-muted-foreground">
                €{(sale.coupons_count * 2).toFixed(2)} in coupons
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleSale(sale.id)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    )
  }

  const renderSaleItem = (item: SaleItem) => (
    <div
      key={item.id}
      className={cn(
        "flex items-center justify-between",
        item.is_deleted && "opacity-50"
      )}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium leading-none">{item.products.name}</p>
          {item.is_treat && (
            <div className="flex items-center gap-1 text-pink-600" title={`Marked as treat ${item.marked_as_treat_by ? `by ${item.marked_as_treat_by}` : ''}`}>
              <Gift className="h-3 w-3" />
              <span className="text-xs">Treat</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Quantity: {item.quantity} | Price: €{item.price_at_sale.toFixed(2)}
          {item.marked_as_treat_at && (
            <span className="ml-2 text-pink-600">
              (Marked as treat {formatDistanceToNow(new Date(item.marked_as_treat_at), { addSuffix: true })})
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">
          {item.is_treat ? (
            <span className="text-pink-800">Free</span>
          ) : (
            `€${(item.quantity * item.price_at_sale).toFixed(2)}`
          )}
        </p>
        {!item.is_deleted && (
          <>
            <EditSaleItemDialog
              saleItemId={item.id}
              productName={item.products.name}
              currentQuantity={item.quantity}
              currentProductId={item.products.id}
              userId={userId}
              onEdit={handleRefresh}
              createdAt={item.created_at}
            />
            <DeleteSaleItemDialog
              saleItemId={item.id}
              productName={item.products.name}
              userId={userId}
              onDelete={handleRefresh}
              createdAt={item.created_at}
            />
          </>
        )}
        {item.last_edited_by && (
          <div className="text-yellow-600" title={`Edited by ${item.last_edited_by} ${item.last_edited_at ? formatDistanceToNow(new Date(item.last_edited_at), { addSuffix: true }) : ''}`}>
            <Pencil className="h-3 w-3" />
          </div>
        )}
        {item.is_deleted && (
          <div className="text-red-600" title={`Deleted by ${item.deleted_by} ${item.deleted_at ? formatDistanceToNow(new Date(item.deleted_at), { addSuffix: true }) : ''}`}>
            <Trash2 className="h-3 w-3" />
          </div>
        )}
      </div>
    </div>
  )

  const renderSaleSummary = (sale: Sale, treatItems: SaleItem[]) => (
    <div className="flex flex-col space-y-2 border-t pt-4">
      <div className="flex items-center justify-between text-sm">
        <p className="font-medium">Subtotal</p>
        <p className="font-medium">€{(sale.total_amount + (sale.coupons_count * 2)).toFixed(2)}</p>
      </div>
      {sale.coupon_applied && (
        <div className="flex items-center justify-between text-sm text-emerald-600">
          <div className="flex items-center gap-1">
            <Ticket className="h-4 w-4" />
            <p>{sale.coupons_count} Coupon{sale.coupons_count > 1 ? 's' : ''} Applied (€{(sale.coupons_count * 2).toFixed(2)})</p>
          </div>
          <p>-€{(sale.coupons_count * 2).toFixed(2)}</p>
        </div>
      )}
      {treatItems.length > 0 && (
        <div className="flex items-center justify-between text-sm text-pink-600">
          <div className="flex items-center gap-1">
            <Gift className="h-4 w-4" />
            <p>{treatItems.length} Treat Item{treatItems.length > 1 ? 's' : ''}</p>
          </div>
          <p>€0.00</p>
        </div>
      )}
      <div className="flex items-center justify-between text-sm font-bold">
        <p>Total Amount</p>
        <p>€{sale.total_amount.toFixed(2)}</p>
      </div>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {sales.map((sale) => {
            const isExpanded = expandedSales.has(sale.id)
            const treatItems = getTreatItems(sale)
            const normalItems = getNormalItems(sale)

            return (
              <div key={`${sale.id}-${refreshKey}`} className="flex flex-col space-y-4">
                {renderSaleHeader(sale, isExpanded)}

                {isExpanded && (
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex gap-4">
                          {sale.coupon_applied && (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <Ticket className="h-4 w-4" />
                              <span>€2 Coupon Applied</span>
                            </div>
                          )}
                          {treatItems.length > 0 && (
                            <div className="flex items-center gap-1 text-pink-600">
                              <Gift className="h-4 w-4" />
                              <span>{treatItems.length} Treat Item{treatItems.length > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {[...normalItems, ...treatItems].map(renderSaleItem)}

                      {renderSaleSummary(sale, treatItems)}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}