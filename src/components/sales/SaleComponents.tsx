'use client'

import { formatCurrency } from "@/lib/utils"
import { Gift, Ticket } from "lucide-react"
import type { Sale } from "@/types/app"

export const TotalDisplay = ({ subtotal, couponsUsed }: { subtotal: number, couponsUsed: number }) => {
  const couponDiscount = couponsUsed * 2
  const finalTotal = Math.max(0, subtotal - couponDiscount)

  if (!couponsUsed) {
    return <span className="font-medium">Total: {formatCurrency(subtotal)}</span>
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

export const StatusIcon = ({ 
  count, 
  icon: Icon, 
  color, 
  label 
}: { 
  count: number
  icon?: React.ElementType
  color: string
  label: string 
}) => {
  if (!count) return null
  
  return (
    <div className={`flex items-center gap-1 ${color}`} title={`${count} ${label}${count > 1 ? 's' : ''}`}>
      {Icon && <Icon className="h-4 w-4" />}
      <span className="text-xs">x{count}</span>
    </div>
  )
}

export const SaleStatusIcons = ({ sale }: { sale: Sale }) => {
  const treatItems = sale.sale_items.filter(item => item.is_treat).length
  const totalCoupons = sale.coupons_used || 0

  return (
    <div className="flex items-center gap-2">
      {totalCoupons > 0 && (
        <StatusIcon 
          count={totalCoupons} 
          icon={Ticket} 
          color="text-emerald-600" 
          label="Coupon" 
        />
      )}
      {treatItems > 0 && (
        <StatusIcon 
          count={treatItems} 
          icon={Gift} 
          color="text-pink-600" 
          label="Treat Item" 
        />
      )}
    </div>
  )
}

// Helper functions
export const getTreatItems = (sale: Sale) => sale.sale_items.filter(item => item.is_treat)
export const getNormalItems = (sale: Sale) => sale.sale_items.filter(item => !item.is_treat)
export const calculateSubtotal = (items: Sale['sale_items']) => 
  items.reduce((total, item) => total + (item.is_deleted ? 0 : item.quantity * item.price_at_sale), 0) 