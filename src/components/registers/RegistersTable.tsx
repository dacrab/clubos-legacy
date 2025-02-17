'use client';

import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Register } from "@/types"
import { 
  ChevronDown, 
  ChevronUp, 
  Gift, 
  ShoppingCart,
  Calendar,
  User,
  Package,
  Ticket,
  Heart,
  DollarSign,
  Info
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import React from "react"
import { useVirtualizer } from "@tanstack/react-virtual"

interface RegistersTableProps {
  registers: Register[] | null
}

interface ProductSummary {
  name: string
  quantity: number
  price: number
  total: number
  is_treat: boolean
  is_edited: boolean
  is_deleted: boolean
  edit_count: number
  delete_count: number
}

interface TreatSummary {
  name: string
  quantity: number
  is_edited: boolean
  is_deleted: boolean
  edit_count: number
  delete_count: number
}

const TotalDisplay = ({ totalIncome, couponsUsed: _couponsUsed }: { totalIncome: number, couponsUsed: number }) => {
  const couponDiscount = _couponsUsed * 2
  const finalTotal = totalIncome
  const subtotal = totalIncome + couponDiscount

  if (!_couponsUsed) {
    return <span className="font-medium">Total: {formatCurrency(totalIncome)}</span>
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

const TreatItem = ({ name, quantity, is_edited, is_deleted, edit_count, delete_count }: TreatSummary) => (
  <tr className="text-sm">
    <td className="py-1">{name}</td>
    <td className="py-1">{quantity}</td>
    <td className="py-1">€0.00</td>
    <td className="py-1">€0.00</td>
    <td className="py-1">
      <StatusBadge type="treat">
        <Gift className="h-3 w-3" />Treat
      </StatusBadge>
    </td>
    <td className="py-1">
      <div className="flex gap-1">
        {is_edited && <StatusBadge type="edited" count={edit_count}>Edited</StatusBadge>}
        {is_deleted && <StatusBadge type="deleted" count={delete_count}>Deleted</StatusBadge>}
      </div>
    </td>
  </tr>
)

const StatusBadge = ({ type, children, count }: { type: 'sale' | 'treat' | 'edited' | 'deleted', children: React.ReactNode, count?: number }) => {
  const styles = {
    sale: "bg-green-100 text-green-800",
    treat: "bg-pink-100 text-pink-800",
    edited: "bg-yellow-100 text-yellow-800",
    deleted: "bg-red-100 text-red-800"
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${styles[type]}`}>
      {children}
      {count !== undefined && count > 1 ? ` (${count})` : ''}
    </span>
  )
}

export function RegistersTable({ registers }: RegistersTableProps) {
  const [expandedRegisters, setExpandedRegisters] = useState<Set<string>>(new Set())
  const tableRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [expandedHeights, setExpandedHeights] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    // Measure heights of expanded rows
    expandedRegisters.forEach(registerId => {
      if (rowRefs.current[registerId]) {
        const height = rowRefs.current[registerId]?.getBoundingClientRect().height || 0
        setExpandedHeights(prev => ({ ...prev, [registerId]: height }))
      }
    })
    rowVirtualizer.measure()
  }, [expandedRegisters])

  if (!registers?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No closed registers found</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const rowVirtualizer = useVirtualizer({
    count: registers.length,
    getScrollElement: () => tableRef.current,
    estimateSize: (index) => {
      const register = registers[index]
      return expandedRegisters.has(register.id) ? (expandedHeights[register.id] || 400) : 100
    },
    overscan: 5,
    measureElement: (element) => {
      return element?.getBoundingClientRect().height ?? 100
    }
  })

  const handleToggleRegister = (registerId: string) => {
    setExpandedRegisters(prev => {
      const next = new Set(prev)
      if (next.has(registerId)) {
        next.delete(registerId)
      } else {
        next.add(registerId)
      }
      return next
    })
  }

  const getProductSummary = (register: Register): ProductSummary[] => {
    const productMap = new Map<string, ProductSummary>()

    register.sales?.forEach(sale => {
      sale.sale_items?.forEach(item => {
        if (!item.is_treat) {
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
            if (isEdited) existing.edit_count++
            if (isDeleted) existing.delete_count++
          } else {
            productMap.set(key, {
              name: item.products.name,
              quantity: item.quantity,
              price: item.price_at_sale,
              total,
              is_treat: item.is_treat,
              is_edited: isEdited,
              is_deleted: isDeleted,
              edit_count: isEdited ? 1 : 0,
              delete_count: isDeleted ? 1 : 0
            })
          }
        }
      })
    })

    return Array.from(productMap.values())
  }

  const getTreatSummary = (register: Register): TreatSummary[] => {
    const treatMap = new Map<string, TreatSummary>()

    register.sales?.forEach(sale => {
      sale.sale_items?.forEach(item => {
        if (item.is_treat) {
          const key = `${item.products.name}-${item.is_deleted ? 'deleted' : 'active'}`
          const existing = treatMap.get(key)
          const isEdited = Boolean(item.last_edited_by)
          const isDeleted = Boolean(item.is_deleted)

          if (existing) {
            existing.quantity += item.quantity
            existing.is_edited = existing.is_edited || isEdited
            existing.is_deleted = existing.is_deleted || isDeleted
            if (isEdited) existing.edit_count++
            if (isDeleted) existing.delete_count++
          } else {
            treatMap.set(key, {
              name: item.products.name,
              quantity: item.quantity,
              is_edited: isEdited,
              is_deleted: isDeleted,
              edit_count: isEdited ? 1 : 0,
              delete_count: isDeleted ? 1 : 0
            })
          }
        }
      })
    })

    return Array.from(treatMap.values())
  }

  const calculateTotalIncome = (products: ProductSummary[]): number => {
    return products.reduce((sum, { total, is_treat }) => sum + (is_treat ? 0 : total), 0)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Closed Registers ({registers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative rounded-md border">
          <div className="border-b sticky top-0 z-20 bg-background">
            <div className="flex items-center h-12">
              <div className="w-[15%] px-4 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Closed At
                </div>
              </div>
              <div className="w-[15%] px-4 font-medium">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Closed By
                </div>
              </div>
              <div className="w-[15%] px-4 font-medium">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Items Sold
                </div>
              </div>
              <div className="w-[15%] px-4 font-medium">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  Coupons Used
                </div>
              </div>
              <div className="w-[15%] px-4 font-medium">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Treats
                </div>
              </div>
              <div className="w-[15%] px-4 font-medium">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total
                </div>
              </div>
              <div className="w-[10%] px-4 font-medium">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Details
                </div>
              </div>
            </div>
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
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const register = registers[virtualRow.index]
                const isExpanded = expandedRegisters.has(register.id)
                const productSummary = getProductSummary(register)
                const totalIncome = calculateTotalIncome(productSummary)
                const nonTreatProducts = productSummary.filter(p => !p.is_treat)
                const treats = getTreatSummary(register)

                return (
                  <div
                    key={register.id}
                    ref={(el) => {
                      rowRefs.current[register.id] = el
                    }}
                    className="absolute left-0 w-full border-b bg-background transition-all duration-200 ease-in-out"
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                      height: 'auto',
                      minHeight: '100px',
                    }}
                  >
                    <div className="p-4 space-y-4">
                      <div className="flex items-center min-h-[60px]">
                        <div className="w-[15%]">
                          {register.closed_at ? formatDate(new Date(register.closed_at)) : "Open"}
                        </div>
                        <div className="w-[15%]">{register.closed_by_name || "N/A"}</div>
                        <div className="w-[15%]">{register.items_sold}</div>
                        <div className="w-[15%]">{register.coupons_used}</div>
                        <div className="w-[15%]">{register.treat_items_sold}</div>
                        <div className="w-[15%]">
                          <div className="flex flex-col gap-1">
                            <TotalDisplay totalIncome={totalIncome} couponsUsed={register.coupons_used} />
                          </div>
                        </div>
                        <div className="w-[10%]">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleRegister(register.id)}
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
                                {nonTreatProducts.map(({ name, quantity, price, total, is_treat, is_edited, is_deleted, edit_count, delete_count }, index) => (
                                  <tr key={`sale-${index}`}>
                                    <td className="py-2">{name}</td>
                                    <td className="py-2">{quantity}</td>
                                    <td className="py-2">{formatCurrency(price)}</td>
                                    <td className="py-2">{formatCurrency(total)}</td>
                                    <td className="py-2">
                                      <StatusBadge type="sale">
                                        <ShoppingCart className="h-3 w-3" />Sale
                                      </StatusBadge>
                                    </td>
                                    <td className="py-2">
                                      <div className="flex gap-1">
                                        {is_edited && <StatusBadge type="edited" count={edit_count}>Edited</StatusBadge>}
                                        {is_deleted && <StatusBadge type="deleted" count={delete_count}>Deleted</StatusBadge>}
                                      </div>
                                    </td>
                                  </tr>
                                ))}

                                {treats.length > 0 && (
                                  <>
                                    <tr>
                                      <td colSpan={6} className="pt-4 pb-2">
                                        <div className="flex items-center gap-2">
                                          <Gift className="h-4 w-4 text-pink-500" />
                                          <span className="font-semibold text-pink-800">
                                            Treats ({register.treat_items_sold})
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                    {treats.map((treat, index) => (
                                      <TreatItem key={`treat-${index}`} {...treat} />
                                    ))}
                                  </>
                                )}

                                <tr className="border-t">
                                  <td colSpan={4} className="py-2 font-bold text-right">Summary:</td>
                                  <td colSpan={2} className="py-2">
                                    <div className="flex flex-col gap-1">
                                      <TotalDisplay totalIncome={totalIncome} couponsUsed={register.coupons_used} />
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
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