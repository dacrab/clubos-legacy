'use client';

import React, { useRef, useEffect, useState, useLayoutEffect } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { 
  ChevronDown, 
  ChevronUp,
  Pencil,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TableDateFilter } from "@/components/ui/table-date-filter"
import { EditSaleItemDialog } from "@/components/sales/EditSaleItemDialog"
import { DeleteSaleItemDialog } from "@/components/sales/DeleteProductDialog"
import type { DateRange } from "react-day-picker"
import { isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns"
import { SalesTableProps, Sale, SaleItem } from "@/types/app"
import { 
  TotalDisplay, 
  SaleStatusIcons, 
  getTreatItems, 
  getNormalItems, 
  calculateSubtotal 
} from "@/components/sales/SaleComponents"

const SaleItemRow = ({ item, userId, onRefresh }: { 
  item: SaleItem
  userId: string
  onRefresh: () => void 
}) => {
  const isZeroPrice = item.price_at_sale === 0 || item.is_treat

  if (!item) {
    return (
      <div className="text-sm text-red-600">
        Error: Invalid sale item data
      </div>
    )
  }

  const productName = item.products?.name || 'Unknown Product'
  const productId = item.products?.id || item.id
  const productPrice = item.products?.price || item.price_at_sale

  return (
    <div className={cn("flex items-center justify-between py-2", item.is_deleted && "opacity-50")}>
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

const SaleDetails = ({ sale, userId, onRefresh }: { 
  sale: Sale
  userId: string
  onRefresh: () => void 
}) => {
  const treatItems = getTreatItems(sale)
  const normalItems = getNormalItems(sale)
  const subtotal = calculateSubtotal(sale.sale_items)

  return (
    <div className="rounded-lg border bg-muted/50 p-4">
      <div className="space-y-4">
        {[...normalItems, ...treatItems].map(item => (
          <SaleItemRow key={item.id} item={item} userId={userId} onRefresh={onRefresh} />
        ))}
        <div className="flex flex-col space-y-2 border-t pt-4">
          <TotalDisplay subtotal={subtotal} couponsUsed={sale.coupons_used} />
        </div>
      </div>
    </div>
  )
}

export function SalesTable({ sales }: SalesTableProps) {
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const tableRef = useRef<HTMLDivElement>(null)
  const [expandedHeights, setExpandedHeights] = useState<Record<string, number>>({})
  const virtualRowRefs = useRef<Record<number, HTMLDivElement | null>>({})

  const handleToggleSale = (saleId: string) => {
    setExpandedSaleId(prev => prev === saleId ? null : saleId)
  }

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range)
    setExpandedSaleId(null)
  }

  const handleClearDateFilter = () => {
    setDateRange(undefined)
    setExpandedSaleId(null)
  }

  const filteredSales = React.useMemo(() => {
    if (!sales) return null
    if (!dateRange?.from) return sales

    return sales.filter(sale => {
      const saleDate = parseISO(sale.created_at)
      const start = startOfDay(dateRange.from as Date)
      const end = dateRange.to ? endOfDay(dateRange.to as Date) : endOfDay(dateRange.from as Date)

      return isWithinInterval(saleDate, { start, end })
    })
  }, [sales, dateRange])

  const rowVirtualizer = useVirtualizer({
    count: filteredSales?.length ?? 0,
    getScrollElement: () => tableRef.current,
    estimateSize: (index) => {
      const sale = filteredSales?.[index]
      return expandedSaleId === sale?.id ? (expandedHeights[sale?.id] || 400) : 100
    },
    overscan: 5,
  })

  useLayoutEffect(() => {
    const updateExpandedHeights = () => {
      const newHeights: Record<string, number> = {}
      let hasChanges = false

      rowVirtualizer.getVirtualItems().forEach((virtualRow) => {
        const sale = filteredSales?.[virtualRow.index]
        if (!sale || expandedSaleId !== sale.id) return

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

    if (expandedSaleId) {
      updateExpandedHeights()
    }
  }, [expandedSaleId, filteredSales, rowVirtualizer, expandedHeights])

  useEffect(() => {
    if (tableRef.current) {
      rowVirtualizer.measure()
    }
  }, [expandedSaleId, expandedHeights, rowVirtualizer])

  const handleRefresh = () => {
    rowVirtualizer.measure()
  }

  if (!filteredSales) return null

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Sales History</CardTitle>
          <TableDateFilter
            date={dateRange}
            onDateChange={handleDateChange}
            onClearFilter={handleClearDateFilter}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={tableRef}
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
              const sale = filteredSales[virtualRow.index]
              const isExpanded = expandedSaleId === sale.id
              const subtotal = calculateSubtotal(sale.sale_items)

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
                  <div className="flex items-center justify-between hover:bg-muted/50 cursor-pointer" onClick={() => handleToggleSale(sale.id)}>
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
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-4">
                      <SaleDetails
                        sale={sale}
                        userId={sale.profile.id}
                        onRefresh={handleRefresh}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}