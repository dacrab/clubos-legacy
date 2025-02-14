'use client'

import { formatDistanceToNow } from "date-fns"
import { ChevronDown, ChevronUp, Gift, Pencil, Trash2, Ticket } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EditSaleItemDialog } from "@/components/sales/EditSaleItemDialog"
import { DeleteSaleItemDialog } from "@/components/sales/DeleteProductDialog"
import { cn, formatCurrency } from "@/lib/utils"

// Type Definitions
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
  coupons_used: number
  coupon_applied: boolean
}

interface RecentSalesProps {
  sales: Sale[] | null
  showEditStatus?: boolean
  userId: string
}

// Helper Functions
const getTreatItems = (sale: Sale) => sale.sale_items.filter(item => item.is_treat)
const getNormalItems = (sale: Sale) => sale.sale_items.filter(item => !item.is_treat)
const calculateSubtotal = (items: SaleItem[]) => 
  items.reduce((total, item) => total + (item.is_deleted ? 0 : item.quantity * item.price_at_sale), 0)

// Components
const SaleItemBadge = ({ type, children }: { type: 'sale' | 'treat' | 'edited' | 'deleted', children: React.ReactNode }) => {
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

const TotalDisplay = ({ subtotal, couponsUsed }: { subtotal: number, couponsUsed: number }) => {
  const couponDiscount = couponsUsed * 2
  const finalTotal = subtotal - couponDiscount

  if (!couponsUsed) {
    return <span className="font-medium">Total: {formatCurrency(finalTotal)}</span>
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

const SaleHeader = ({ sale, isExpanded, onToggle }: { 
  sale: Sale, 
  isExpanded: boolean, 
  onToggle: () => void 
}) => {
  const treatItems = getTreatItems(sale)
  const subtotal = calculateSubtotal(sale.sale_items)
  const totalCoupons = sale.coupons_used || 0

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium leading-none">Order #{sale.id.slice(-4)}</p>
          {totalCoupons > 0 && (
            <div className="flex items-center gap-1 text-emerald-600" title={`${totalCoupons} Coupon${totalCoupons > 1 ? 's' : ''} Applied (€${(totalCoupons * 2).toFixed(2)})`}>
              <Ticket className="h-4 w-4" />
              <span className="text-xs">x{totalCoupons}</span>
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
          <TotalDisplay subtotal={subtotal} couponsUsed={totalCoupons} />
        </div>
        <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

const SaleItem = ({ item, userId, onRefresh }: { 
  item: SaleItem, 
  userId: string, 
  onRefresh: () => void 
}) => {
  const isZeroPrice = item.price_at_sale === 0 || item.is_treat

  return (
    <div className={cn("flex items-center justify-between", item.is_deleted && "opacity-50")}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium leading-none">{item.products.name}</p>
          {isZeroPrice && (
            <div className="flex items-center gap-1 text-pink-600" title={`Marked as treat ${item.marked_as_treat_by ? `by ${item.marked_as_treat_by}` : ''}`}>
              <Gift className="h-3 w-3" />
              <span className="text-xs">Treat</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Quantity: {item.quantity} | Price: {formatCurrency(item.price_at_sale)}
          {item.marked_as_treat_at && (
            <span className="ml-2 text-pink-600">
              (Marked as treat {formatDistanceToNow(new Date(item.marked_as_treat_at), { addSuffix: true })})
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">
          {isZeroPrice ? <span className="text-pink-800">Free</span> : formatCurrency(item.quantity * item.price_at_sale)}
        </p>
        {!item.is_deleted && (
          <>
            <EditSaleItemDialog
              saleItemId={item.id}
              productName={item.products.name}
              currentQuantity={item.quantity}
              currentProductId={item.products.id}
              userId={userId}
              onEdit={onRefresh}
              createdAt={item.created_at}
            />
            <DeleteSaleItemDialog
              saleItemId={item.id}
              productName={item.products.name}
              userId={userId}
              onDelete={onRefresh}
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
}

const SaleDetails = ({ sale, userId, onRefresh }: { 
  sale: Sale, 
  userId: string, 
  onRefresh: () => void 
}) => {
  const treatItems = getTreatItems(sale)
  const normalItems = getNormalItems(sale)
  const subtotal = calculateSubtotal(sale.sale_items)

  return (
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

        {[...normalItems, ...treatItems].map(item => (
          <SaleItem key={item.id} item={item} userId={userId} onRefresh={onRefresh} />
        ))}

        <div className="flex flex-col space-y-2 border-t pt-4">
          <TotalDisplay subtotal={subtotal} couponsUsed={sale.coupons_used} />
        </div>
      </div>
    </div>
  )
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
      next.has(saleId) ? next.delete(saleId) : next.add(saleId)
      return next
    })
  }

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {sales.map((sale) => {
            const isExpanded = expandedSales.has(sale.id)

            return (
              <div key={`${sale.id}-${refreshKey}`} className="flex flex-col space-y-4">
                <SaleHeader 
                  sale={sale} 
                  isExpanded={isExpanded} 
                  onToggle={() => handleToggleSale(sale.id)} 
                />
                {isExpanded && (
                  <SaleDetails 
                    sale={sale} 
                    userId={userId} 
                    onRefresh={handleRefresh} 
                  />
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}