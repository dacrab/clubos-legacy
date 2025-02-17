'use client';

import React, { useRef, useEffect } from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
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
  ChevronRight
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

// Types
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

// Components
const TotalDisplay = ({ totalAmount, couponsUsed }: { totalAmount: number, couponsUsed: number }) => {
  const couponDiscount = couponsUsed * 2
  const subtotal = totalAmount
  const finalTotal = subtotal - couponDiscount

  if (!couponsUsed) {
    return <span className="font-medium">{formatCurrency(totalAmount)}</span>
  }

  return (
    <>
      <div className="text-sm">Subtotal: {formatCurrency(subtotal)}</div>
      <div className="text-sm text-red-600">
        Coupon: -{formatCurrency(couponDiscount)}
      </div>
      <div className="font-medium">Final: {formatCurrency(finalTotal)}</div>
    </>
  )
}

const StatusIcon = ({ count, icon: Icon, color, label }: { count: number, icon?: React.ElementType, color: string, label: string }) => {
  if (!count) return null
  
  return (
    <div className={`flex items-center gap-1 ${color}`} title={`${count} ${label}${count > 1 ? 's' : ''}`}>
      {Icon && <Icon className="h-4 w-4" />}
      <span className="text-xs">x{count}</span>
    </div>
  )
}

const SaleStatusIcons = ({ sale }: { sale: Sale }) => {
  const editedItems = sale.sale_items.filter(item => item.last_edited_by && !item.is_treat).length
  const deletedItems = sale.sale_items.filter(item => item.is_deleted && !item.is_treat).length
  const treatItems = sale.sale_items.filter(item => item.is_treat).length

  return (
    <div className="flex items-center gap-2">
      {sale.coupon_applied && (
        <StatusIcon count={sale.coupons_used} icon={Ticket} color="text-emerald-600" label="Coupon" />
      )}
      <StatusIcon count={treatItems} icon={Gift} color="text-pink-600" label="Treat Item" />
      <StatusIcon count={editedItems} color="text-yellow-600" label="Edited Item" />
      <StatusIcon count={deletedItems} color="text-red-600" label="Deleted Item" />
    </div>
  )
}

const ProductRow = ({ product }: { product: ProductSummary }) => {
  const getStatusColor = () => {
    if (product.is_deleted) return "text-red-600"
    if (product.is_edited) return "text-yellow-600"
    return "text-green-600"
  }

  const getStatusText = () => {
    if (product.is_deleted) return "Deleted"
    if (product.is_edited) return "Edited"
    return "Original"
  }

  return (
    <tr className="border-t">
      <td className="py-2">{product.name}</td>
      <td className="py-2">{product.quantity}</td>
      <td className="py-2">{formatCurrency(product.price)}</td>
      <td className="py-2">{formatCurrency(product.total)}</td>
      <td className="py-2">
        <span className={product.is_treat ? "text-pink-600" : ""}>
          {product.is_treat ? "Treat" : "Regular"}
        </span>
      </td>
      <td className="py-2">
        <span className={getStatusColor()}>{getStatusText()}</span>
      </td>
    </tr>
  )
}

const SaleDetails = ({ sale, productSummary }: { sale: Sale, productSummary: ProductSummary[] }) => {
  const calculateSubtotal = () => {
    return productSummary.reduce((total, product) => 
      total + (product.is_deleted ? 0 : product.total), 0)
  }

  const subtotal = calculateSubtotal()
  const couponDiscount = sale.coupon_applied ? sale.coupons_used * 2 : 0
  const finalTotal = subtotal - couponDiscount

  return (
    <div className="rounded-lg border bg-muted/50 p-4 mb-4 relative z-10">
      <table className="w-full">
        <thead>
          <tr>
            {["Product", "Quantity", "Price", "Total", "Type", "Status"].map(header => (
              <th key={header} className="text-left font-medium py-2">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {productSummary.map((product, index) => (
            <ProductRow key={`${sale.id}-${index}`} product={product} />
          ))}
          <tr className="border-t">
            <td colSpan={3} className="py-4 font-bold text-right">Summary:</td>
            <td colSpan={3} className="py-4">
              <div className="flex flex-col gap-1">
                <TotalDisplay 
                  totalAmount={subtotal} 
                  couponsUsed={sale.coupon_applied ? sale.coupons_used : 0} 
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

const TableHeader = () => (
  <div className="border-b sticky top-0 z-20 bg-background">
    <div className="flex items-center py-4 px-4">
      {[
        { icon: Calendar, text: "Date", width: "20%" },
        { icon: User, text: "Staff", width: "20%" },
        { icon: ShoppingCart, text: "Items", width: "20%" },
        { icon: DollarSign, text: "Total", width: "30%" },
        { icon: ChevronRight, text: "Details", width: "10%" }
      ].map(({ icon: Icon, text, width }) => (
        <div key={text} className={`w-[${width}] flex items-center gap-2`}>
          <Icon className="h-4 w-4" />
          {text}
        </div>
      ))}
    </div>
  </div>
)

export function SalesTable({ sales }: SalesTableProps) {
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [expandedHeight, setExpandedHeight] = useState<number>(0)

  const handleToggleSale = (saleId: string) => {
    setExpandedSaleId(prev => prev === saleId ? null : saleId)
  }

  const getProductSummary = (sale: Sale): ProductSummary[] => {
    const productMap = new Map<string, ProductSummary>()

    sale.sale_items.forEach(item => {
      if (item.is_treat && item.is_deleted) return

      const key = `${item.products.name}-${Boolean(item.is_deleted) ? 'deleted' : 'active'}`
      const existing = productMap.get(key)
      const total = item.price_at_sale * item.quantity

      if (existing) {
        existing.quantity += item.quantity
        existing.total += total
        if (!item.is_treat) {
          existing.is_edited = existing.is_edited || Boolean(item.last_edited_by)
          existing.is_deleted = existing.is_deleted || Boolean(item.is_deleted)
        }
      } else {
        productMap.set(key, {
          name: item.products.name,
          quantity: item.quantity,
          price: item.price_at_sale,
          total,
          is_treat: item.is_treat,
          is_edited: !item.is_treat && Boolean(item.last_edited_by),
          is_deleted: !item.is_treat && Boolean(item.is_deleted)
        })
      }
    })

    return Array.from(productMap.values())
  }

  useEffect(() => {
    if (expandedSaleId && rowRefs.current[expandedSaleId]) {
      const height = rowRefs.current[expandedSaleId]?.getBoundingClientRect().height || 0
      setExpandedHeight(height)
      rowVirtualizer.measure()
    } else {
      setExpandedHeight(0)
      rowVirtualizer.measure()
    }
  }, [expandedSaleId])

  if (!sales?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No sales found</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const rowVirtualizer = useVirtualizer({
    count: sales.length,
    getScrollElement: () => tableRef.current,
    estimateSize: (index) => expandedSaleId === sales[index].id ? expandedHeight : 100,
    overscan: 5,
    measureElement: element => element?.getBoundingClientRect().height ?? 100
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales ({sales.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-md border">
          <TableHeader />
          <div ref={tableRef} className="h-[600px] overflow-auto">
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const sale = sales[virtualRow.index]
                const isExpanded = expandedSaleId === sale.id
                const productSummary = getProductSummary(sale)

                return (
                  <div
                    key={sale.id}
                    ref={el => { rowRefs.current[sale.id] = el }}
                    className="absolute left-0 w-full border-b bg-background transition-all duration-200 ease-in-out"
                    style={{
                      top: 0,
                      transform: `translateY(${virtualRow.start}px)`,
                      height: 'auto',
                      minHeight: '100px',
                    }}
                  >
                    <div className="p-4 space-y-4">
                      <div className="flex items-center min-h-[60px]">
                        <div className="w-[20%]">{formatDate(new Date(sale.created_at))}</div>
                        <div className="w-[20%]">{sale.profile.name}</div>
                        <div className="w-[20%]">
                          {sale.sale_items.reduce((sum, item) => sum + item.quantity, 0)}
                        </div>
                        <div className="w-[30%] flex flex-col justify-center py-2">
                          <TotalDisplay 
                            totalAmount={sale.total_amount} 
                            couponsUsed={sale.coupon_applied ? sale.coupons_used : 0} 
                          />
                        </div>
                        <div className="w-[10%]">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleSale(sale.id)}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div 
                          className="mt-4 transition-all duration-200 ease-in-out"
                          style={{
                            opacity: isExpanded ? 1 : 0,
                            maxHeight: isExpanded ? '1000px' : '0px',
                            overflow: 'hidden'
                          }}
                        >
                          <SaleDetails sale={sale} productSummary={productSummary} />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}