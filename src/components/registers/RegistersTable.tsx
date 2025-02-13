'use client';

import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Register } from "@/types"
import { ChevronDown, ChevronUp, Gift } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import React from "react"

interface RegistersTableProps {
  registers: Register[] | null
}

interface ProductSummary {
  name: string
  quantity: number
  price: number
  total: number
  is_treat: boolean
}

interface TreatSummary {
  name: string
  quantity: number
}

export function RegistersTable({ registers }: RegistersTableProps) {
  const [expandedRegisters, setExpandedRegisters] = useState<Set<string>>(new Set())

  if (!registers?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No closed registers found</CardTitle>
        </CardHeader>
      </Card>
    )
  }

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
      sale.sale_items?.forEach(({ products, quantity, price_at_sale, is_treat }) => {
        const existing = productMap.get(products.name)
        const total = price_at_sale * quantity

        if (existing) {
          existing.quantity += quantity
          existing.total += total
        } else {
          productMap.set(products.name, {
            name: products.name,
            quantity,
            price: price_at_sale,
            total,
            is_treat
          })
        }
      })
    })

    return Array.from(productMap.values())
  }

  const getTreatSummary = (register: Register): TreatSummary[] => {
    const treatMap = new Map<string, TreatSummary>()

    register.sales?.forEach(sale => {
      sale.sale_items?.forEach(({ products, quantity, is_treat }) => {
        if (is_treat) {
          const existing = treatMap.get(products.name)
          if (existing) {
            existing.quantity += quantity
          } else {
            treatMap.set(products.name, {
              name: products.name,
              quantity
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
        <CardTitle>Closed Registers ({registers.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">Closed At</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Closed By</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Items Sold</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Coupons Used</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Treats</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Total</th>
                <th className="h-12 px-4 text-left align-middle font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {registers.map((register) => {
                const isExpanded = expandedRegisters.has(register.id)
                const productSummary = getProductSummary(register)
                const totalIncome = calculateTotalIncome(productSummary)

                return (
                  <React.Fragment key={register.id}>
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle">
                        {register.closed_at ? formatDate(new Date(register.closed_at)) : "Open"}
                      </td>
                      <td className="p-4 align-middle">{register.closed_by_name || "N/A"}</td>
                      <td className="p-4 align-middle">{register.items_sold}</td>
                      <td className="p-4 align-middle">{register.coupons_used}</td>
                      <td className="p-4 align-middle">{register.treat_items_sold}</td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col gap-1">
                          {register.coupons_used > 0 ? (
                            <>
                              <div className="text-sm text-muted-foreground line-through">
                                Subtotal: {formatCurrency(register.total_amount + (register.coupons_used * 2))}
                              </div>
                              <div className="text-sm text-red-600">
                                Coupon discount: -{formatCurrency(register.coupons_used * 2)}
                              </div>
                              <div className="font-medium">
                                Final total: {formatCurrency(register.total_amount)}
                              </div>
                            </>
                          ) : (
                            <span className="font-medium">
                              Total: {formatCurrency(register.total_amount)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleRegister(register.id)}
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
                        <td colSpan={7} className="p-4">
                          <div className="rounded-lg border bg-muted/50 p-4">
                            <table className="w-full">
                              <thead>
                                <tr>
                                  <th className="text-left font-medium">Product</th>
                                  <th className="text-left font-medium">Quantity</th>
                                  <th className="text-left font-medium">Price</th>
                                  <th className="text-left font-medium">Total</th>
                                  <th className="text-left font-medium">Type</th>
                                </tr>
                              </thead>
                              <tbody>
                                {productSummary
                                  .filter(({ is_treat }) => !is_treat)
                                  .map(({ name, quantity, price, total }, index) => (
                                    <tr key={`sale-${index}`}>
                                      <td className="py-2">{name}</td>
                                      <td className="py-2">{quantity}</td>
                                      <td className="py-2">{formatCurrency(price)}</td>
                                      <td className="py-2">{formatCurrency(total)}</td>
                                      <td className="py-2">
                                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                                          Sale
                                        </span>
                                      </td>
                                    </tr>
                                  ))}

                                {/* Treats Section */}
                                {getTreatSummary(register).length > 0 && (
                                  <>
                                    <tr>
                                      <td colSpan={5} className="pt-4 pb-2">
                                        <div className="flex items-center gap-2">
                                          <Gift className="h-4 w-4 text-pink-500" />
                                          <span className="font-semibold text-pink-800">
                                            Treats ({register.treat_items_sold})
                                          </span>
                                        </div>
                                      </td>
                                    </tr>
                                    {getTreatSummary(register).map(({ name, quantity }, index) => (
                                      <tr key={`treat-${index}`} className="text-sm">
                                        <td className="py-1">{name}</td>
                                        <td className="py-1">{quantity}</td>
                                        <td className="py-1">€0.00</td>
                                        <td className="py-1">€0.00</td>
                                        <td className="py-1">
                                          <div className="flex items-center gap-1 text-pink-800">
                                            <Gift className="h-4 w-4" />
                                            {quantity > 1 && <span>x{quantity}</span>}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </>
                                )}

                                <tr className="border-t">
                                  <td colSpan={3} className="py-2 font-bold text-right">Summary:</td>
                                  <td colSpan={2} className="py-2">
                                    <div className="flex flex-col gap-1">
                                      <div className="text-sm">
                                        Subtotal: {formatCurrency(totalIncome + (register.coupons_used * 2))}
                                      </div>
                                      {register.coupons_used > 0 && (
                                        <div className="text-sm text-red-600">
                                          Coupon discount: -{formatCurrency(register.coupons_used * 2)}
                                        </div>
                                      )}
                                      <div className="font-bold">
                                        Final total: {formatCurrency(totalIncome)}
                                      </div>
                                    </div>
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