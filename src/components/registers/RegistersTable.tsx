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
  Calendar,
  User,
  Package,
  Ticket,
  Heart,
  DollarSign,
  Info,
} from "lucide-react"
import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { Button } from "@/components/ui/button"
import React from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { TableDateFilter } from "@/components/ui/table-date-filter"
import type { DateRange } from "react-day-picker"
import { isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns"

// Types
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

// Components
const TotalDisplay = ({ totalIncome, couponsUsed }: { totalIncome: number, couponsUsed: number }) => {
  if (!couponsUsed) {
    return <span className="font-medium">Total: {formatCurrency(totalIncome)}</span>
  }

  return (
    <div className="font-medium">
      Total: {formatCurrency(totalIncome)}
      <div className="text-xs text-muted-foreground">
        (Includes €{(couponsUsed * 2).toFixed(2)} coupon discount)
      </div>
    </div>
  )
}

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

const TableHeader = () => (
  <div className="border-b sticky top-0 z-20 bg-background">
    <div className="flex items-center h-12">
      <HeaderCell icon={<Calendar className="h-4 w-4" />} text="Closed At" width="15%" />
      <HeaderCell icon={<User className="h-4 w-4" />} text="Closed By" width="15%" />
      <HeaderCell icon={<Package className="h-4 w-4" />} text="Items Sold" width="15%" />
      <HeaderCell icon={<Ticket className="h-4 w-4" />} text="Coupons Used" width="15%" />
      <HeaderCell icon={<Heart className="h-4 w-4" />} text="Treats" width="15%" />
      <HeaderCell icon={<DollarSign className="h-4 w-4" />} text="Total" width="15%" />
      <HeaderCell icon={<Info className="h-4 w-4" />} text="Details" width="10%" />
    </div>
  </div>
)

const HeaderCell = ({ icon, text, width }: { icon: React.ReactNode, text: string, width: string }) => (
  <div className={`w-[${width}] px-4 font-medium`}>
    <div className="flex items-center gap-2">
      {icon}
      {text}
    </div>
  </div>
)

// Main Component
export function RegistersTable({ registers }: RegistersTableProps) {
  const [expandedRegisters, setExpandedRegisters] = useState<Set<string>>(new Set())
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const tableRef = useRef<HTMLDivElement>(null)
  const [expandedHeights, setExpandedHeights] = useState<Record<string, number>>({})
  const virtualRowRefs = useRef<Record<number, HTMLDivElement | null>>({})

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

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range)
    setExpandedRegisters(new Set())
  }

  const handleClearDateFilter = () => {
    setDateRange(undefined)
    setExpandedRegisters(new Set())
  }

  const filteredRegisters = React.useMemo(() => {
    if (!registers) return null
    if (!dateRange?.from) return registers

    return registers.filter(register => {
      const registerDate = parseISO(register.closed_at || register.opened_at)
      const start = startOfDay(dateRange.from as Date)
      const end = dateRange.to ? endOfDay(dateRange.to as Date) : endOfDay(dateRange.from as Date)

      return isWithinInterval(registerDate, { start, end })
    })
  }, [registers, dateRange])

  const rowVirtualizer = useVirtualizer({
    count: filteredRegisters?.length || 0,
    getScrollElement: () => tableRef.current,
    estimateSize: (index) => {
      const register = filteredRegisters?.[index]
      return expandedRegisters.has(register?.id || '') ? (expandedHeights[register?.id || ''] || 400) : 100
    },
    overscan: 5,
  })

  useLayoutEffect(() => {
    const updateExpandedHeights = () => {
      const newHeights: Record<string, number> = {}
      let hasChanges = false

      rowVirtualizer.getVirtualItems().forEach((virtualRow) => {
        const register = filteredRegisters?.[virtualRow.index]
        if (!register || !expandedRegisters.has(register.id)) return

        const element = virtualRowRefs.current[virtualRow.index]
        if (!element) return

        const height = element.getBoundingClientRect().height
        if (height !== expandedHeights[register.id]) {
          newHeights[register.id] = height
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

    if (expandedRegisters.size > 0) {
      updateExpandedHeights()
    }
  }, [expandedRegisters, filteredRegisters, rowVirtualizer, expandedHeights])

  useEffect(() => {
    if (tableRef.current) {
      rowVirtualizer.measure()
    }
  }, [expandedRegisters, expandedHeights, rowVirtualizer])

  if (!registers?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No closed registers found</CardTitle>
        </CardHeader>
      </Card>
    )
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Closed Registers</CardTitle>
          <TableDateFilter
            date={dateRange}
            onDateChange={handleDateChange}
            onClearFilter={handleClearDateFilter}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <TableHeader />
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
                const register = filteredRegisters?.[virtualRow.index]
                if (!register) return null

                const isExpanded = expandedRegisters.has(register.id)
                const productSummary = getProductSummary(register)
                const treatSummary = getTreatSummary(register)

                return (
                  <div
                    key={virtualRow.index}
                    data-index={virtualRow.index}
                    ref={el => {
                      virtualRowRefs.current[virtualRow.index] = el
                    }}
                    className={`absolute top-0 left-0 w-full border-b p-4 ${
                      virtualRow.index % 2 === 0 ? "bg-background" : "bg-muted/50"
                    }`}
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="flex items-center py-4 px-4 hover:bg-muted/50">
                      <div className="w-[15%]">
                        {formatDate(parseISO(register.closed_at || register.opened_at))}
                      </div>
                      <div className="w-[15%]">
                        {register.profiles?.name || 'N/A'}
                      </div>
                      <div className="w-[15%]">{register.items_sold}</div>
                      <div className="w-[15%]">{register.coupons_used}</div>
                      <div className="w-[15%]">{register.treat_items_sold}</div>
                      <div className="w-[15%]">
                        <TotalDisplay
                          totalIncome={register.total_amount}
                          couponsUsed={register.coupons_used}
                        />
                      </div>
                      <div className="w-[10%] text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleRegister(register.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="rounded-lg border bg-muted/50 p-4">
                          <h3 className="font-medium mb-4">Products Sold</h3>
                          <div className="space-y-4">
                            {productSummary.length > 0 && (
                              <table className="w-full">
                                <thead>
                                  <tr>
                                    <th className="text-left font-medium py-2">Product</th>
                                    <th className="text-left font-medium py-2">Quantity</th>
                                    <th className="text-left font-medium py-2">Price</th>
                                    <th className="text-left font-medium py-2">Total</th>
                                    <th className="text-left font-medium py-2">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {productSummary.map((product, index) => (
                                    <tr key={index} className="border-t">
                                      <td className="py-2">{product.name}</td>
                                      <td className="py-2">{product.quantity}</td>
                                      <td className="py-2">{formatCurrency(product.price)}</td>
                                      <td className="py-2">{formatCurrency(product.total)}</td>
                                      <td className="py-2">
                                        <div className="flex gap-1">
                                          {product.is_edited && (
                                            <StatusBadge type="edited" count={product.edit_count}>
                                              Edited
                                            </StatusBadge>
                                          )}
                                          {product.is_deleted && (
                                            <StatusBadge type="deleted" count={product.delete_count}>
                                              Deleted
                                            </StatusBadge>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                            {treatSummary.length > 0 && (
                              <>
                                <h3 className="font-medium mb-2 mt-6">Treats Given</h3>
                                <table className="w-full">
                                  <thead>
                                    <tr>
                                      <th className="text-left font-medium py-2">Product</th>
                                      <th className="text-left font-medium py-2">Quantity</th>
                                      <th className="text-left font-medium py-2">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {treatSummary.map((treat, index) => (
                                      <tr key={index} className="border-t">
                                        <td className="py-2">{treat.name}</td>
                                        <td className="py-2">{treat.quantity}</td>
                                        <td className="py-2">
                                          <div className="flex gap-1">
                                            {treat.is_edited && (
                                              <StatusBadge type="edited" count={treat.edit_count}>
                                                Edited
                                              </StatusBadge>
                                            )}
                                            {treat.is_deleted && (
                                              <StatusBadge type="deleted" count={treat.delete_count}>
                                                Deleted
                                              </StatusBadge>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
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