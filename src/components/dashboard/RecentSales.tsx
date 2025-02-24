'use client'

import { formatDistanceToNow } from "date-fns"
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react"
import { useState, useEffect, forwardRef, useImperativeHandle, useRef, useLayoutEffect } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EditSaleItemDialog } from "@/components/sales/EditSaleItemDialog"
import { DeleteSaleItemDialog } from "@/components/sales/DeleteProductDialog"
import { cn } from "@/lib/utils"
import type { 
  SaleItem, 
  RecentSalesRef,
  RecentSalesProps,
  SaleItemRowProps,
  SaleHeaderProps,
  SaleDetailsProps 
} from "@/types"
import { 
  TotalDisplay, 
  SaleStatusIcons, 
  getTreatItems, 
  getNormalItems, 
  calculateSubtotal 
} from "@/components/sales/SaleComponents"

const SaleItem = ({ item, userId, onRefresh }: SaleItemRowProps) => {
  const isZeroPrice = item.price_at_sale === 0 || item.is_treat

  // Early return with error UI if item is invalid
  if (!item) {
    return (
      <div className="text-sm text-red-600">
        Error: Invalid sale item data
      </div>
    )
  }

  // Handle missing product data gracefully
  const productName = item.products?.name || 'Unknown Product'
  const productId = item.products?.id || item.id

  return (
    <div className={cn("flex items-center justify-between", item.is_deleted && "opacity-50")}>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium leading-none">{productName}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Quantity: {item.quantity} | Price: {isZeroPrice ? "Free" : `€${item.price_at_sale.toFixed(2)}`}
          {item.marked_as_treat_at && (
            <span className="ml-2 text-pink-600">
              (Marked as treat {formatDistanceToNow(new Date(item.marked_as_treat_at), { addSuffix: true })})
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">
          {isZeroPrice ? <span className="text-pink-800">Free</span> : `€${(item.quantity * item.price_at_sale).toFixed(2)}`}
        </p>
        {!item.is_deleted && (
          <>
            <EditSaleItemDialog
              saleItemId={item.id}
              productName={productName}
              currentQuantity={item.quantity}
              currentProductId={productId}
              userId={userId}
              onEdit={onRefresh}
              createdAt={item.created_at}
            />
            <DeleteSaleItemDialog
              saleItemId={item.id}
              productName={productName}
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

const SaleHeader = ({ sale, isExpanded, onToggle }: SaleHeaderProps) => {
  const subtotal = calculateSubtotal(sale.sale_items)

  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium leading-none">Order #{sale.id.slice(-4)}</p>
          <SaleStatusIcons sale={sale} />
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(sale.created_at), { addSuffix: true })} by {sale.profile.name}
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <TotalDisplay subtotal={subtotal} couponsUsed={sale.coupons_used} />
        </div>
        <Button variant="ghost" size="sm" onClick={onToggle} className="h-8 w-8 p-0">
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

const SaleDetails = ({ sale, userId, onRefresh }: SaleDetailsProps) => {
  const treatItems = getTreatItems(sale)
  const normalItems = getNormalItems(sale)
  const subtotal = calculateSubtotal(sale.sale_items)

  return (
    <div className="rounded-lg border bg-muted/50 p-4">
      <div className="space-y-4">
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

export const RecentSales = forwardRef<RecentSalesRef, RecentSalesProps>(
  ({ sales, userId }, ref) => {
    const [expandedSales, setExpandedSales] = useState<Set<string>>(new Set())
    const [expandedHeights, setExpandedHeights] = useState<Record<string, number>>({})
    const parentRef = useRef<HTMLDivElement>(null)
    const virtualRowRefs = useRef<Record<number, HTMLDivElement | null>>({})

    const rowVirtualizer = useVirtualizer({
      count: sales?.length || 0,
      getScrollElement: () => parentRef.current,
      estimateSize: (index) => {
        const sale = sales?.[index]
        return expandedSales.has(sale?.id || '') ? (expandedHeights[sale?.id || ''] || 400) : 100
      },
      overscan: 5,
    })

    useLayoutEffect(() => {
      const updateExpandedHeights = () => {
        const newHeights: Record<string, number> = {}
        let hasChanges = false

        rowVirtualizer.getVirtualItems().forEach((virtualRow) => {
          const sale = sales?.[virtualRow.index]
          if (!sale || !expandedSales.has(sale.id)) return

          const element = virtualRowRefs.current[virtualRow.index]
          if (!element) return

          const height = element.getBoundingClientRect().height
          if (height !== expandedHeights[sale.id]) {
            newHeights[sale.id] = height
            hasChanges = true
          }
        })

        if (hasChanges) {
          setExpandedHeights(prev => ({
            ...prev,
            ...newHeights
          }))
        }
      }

      if (expandedSales.size > 0) {
        updateExpandedHeights()
      }
    }, [expandedSales, sales, rowVirtualizer, expandedHeights])

    useEffect(() => {
      if (parentRef.current) {
        rowVirtualizer.measure()
      }
    }, [expandedSales, expandedHeights, rowVirtualizer])

    useImperativeHandle(ref, () => ({
      clearSales: () => {
        setExpandedSales(new Set())
        setExpandedHeights({})
      },
      refresh: () => {
        rowVirtualizer.measure()
      }
    }))

    const handleToggle = (saleId: string) => {
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
      rowVirtualizer.measure()
    }

    if (!sales?.length) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent sales found.</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            ref={parentRef}
            className="relative h-[600px] overflow-auto"
            style={{
              contain: 'strict',
            }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const sale = sales[virtualRow.index]
                const isExpanded = expandedSales.has(sale.id)

                return (
                  <div
                    key={virtualRow.index}
                    data-index={virtualRow.index}
                    ref={el => {
                      virtualRowRefs.current[virtualRow.index] = el
                    }}
                    className={cn(
                      "absolute top-0 left-0 w-full border-b p-4",
                      virtualRow.index % 2 === 0 ? "bg-background" : "bg-muted/50"
                    )}
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="space-y-4">
                      <SaleHeader
                        sale={sale}
                        isExpanded={isExpanded}
                        onToggle={() => handleToggle(sale.id)}
                      />
                      {isExpanded && (
                        <SaleDetails
                          sale={sale}
                          userId={userId}
                          onRefresh={handleRefresh}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)

RecentSales.displayName = "RecentSales"