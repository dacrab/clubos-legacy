'use client';

import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Sale } from "@/types"
import { Gift, Ticket } from "lucide-react"

interface SalesTableProps {
  sales: Sale[] | null
}

export function SalesTable({ sales }: SalesTableProps) {
  if (!sales?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No sales found</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales ({sales.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Date
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Staff
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Items
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Total
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {sales.map((sale) => (
                <tr
                  key={sale.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle">
                    {formatDate(new Date(sale.created_at))}
                  </td>
                  <td className="p-4 align-middle">
                    {sale.profile.name}
                  </td>
                  <td className="p-4 align-middle">
                    <ul className="list-inside space-y-1">
                      {sale.sale_items.map((item) => (
                        <li key={item.id} className="flex items-center gap-2">
                          <span>{item.products.name} x {item.quantity}</span>
                          {item.is_treat && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-800">
                              <Gift className="h-3 w-3" />
                              Treat
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">
                        {formatCurrency(sale.total_amount)}
                      </span>
                      {sale.coupon_applied && (
                        <span className="text-xs text-muted-foreground">
                          -{formatCurrency(sale.coupons_used * 2)} ({sale.coupons_used} coupon{sale.coupons_used !== 1 ? 's' : ''})
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex flex-col gap-2">
                      {sale.coupon_applied && (
                        <div className="flex items-center gap-1">
                          <Ticket className="h-4 w-4 text-blue-500" />
                          <span className="text-xs text-muted-foreground">
                            {sale.coupons_used} Coupon{sale.coupons_used !== 1 ? 's' : ''} Used
                          </span>
                        </div>
                      )}
                      {sale.sale_items.some(
                        (item) => item.is_treat
                      ) && (
                        <div className="flex items-center gap-1">
                          <Gift className="h-4 w-4 text-pink-500" />
                          <span className="text-xs text-muted-foreground">
                            {sale.sale_items.filter(item => item.is_treat).length} Treat{sale.sale_items.filter(item => item.is_treat).length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                      {sale.sale_items.some(
                        (item) =>
                          item.products.last_edited_by || item.products.is_deleted
                      ) && (
                        <div className="flex gap-1">
                          {sale.sale_items.some(
                            (item) => item.products.last_edited_by
                          ) && (
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                              Edited
                            </span>
                          )}
                          {sale.sale_items.some(
                            (item) => item.products.is_deleted
                          ) && (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                              Deleted
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
} 