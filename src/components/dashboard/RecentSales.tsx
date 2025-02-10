import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Sale } from "@/types"

interface RecentSalesProps extends React.HTMLAttributes<HTMLDivElement> {
  sales: Sale[] | null
  showEditStatus?: boolean
}

export function RecentSales({
  sales,
  showEditStatus = false,
  className,
}: RecentSalesProps) {
  if (!sales?.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>No recent sales found</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>
          {showEditStatus
            ? "Recent sales with product edit status"
            : "Your most recent sales"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {sales.map((sale) => (
            <div key={sale.id} className="flex items-center">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">
                  {sale.profile.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(new Date(sale.created_at))}
                </p>
              </div>
              <div className="ml-auto font-medium">
                {formatCurrency(sale.total_amount)}
              </div>
              {showEditStatus && sale.sale_items?.some(
                (item) => 
                  item.products.last_edited_by || 
                  item.products.is_deleted
              ) && (
                <div className="ml-2 flex gap-2">
                  {sale.sale_items.some(
                    (item) => item.products.last_edited_by
                  ) && (
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                      Edited
                    </span>
                  )}
                  {sale.sale_items.some(
                    (item) => item.products.is_deleted
                  ) && (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                      Deleted
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 