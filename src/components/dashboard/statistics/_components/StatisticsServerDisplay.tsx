import type { SaleWithDetails } from '@/types/sales';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import StatsCards from '../StatsCards';

interface StatisticsServerDisplayProps {
  sales: SaleWithDetails[];
}

export default function StatisticsServerDisplay({ sales }: StatisticsServerDisplayProps) {
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <StatsCards sales={sales} />

      {/* Sales Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Σύνοψη Πωλήσεων</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Σύνολο πωλήσεων:</span>
                <span className="font-medium">{sales.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Μοναδικά προϊόντα:</span>
                <span className="font-medium">{new Set(sales.map(s => s.productId)).size}</span>
              </div>
              <div className="flex justify-between">
                <span>Περίοδος:</span>
                <span className="text-sm font-medium">
                  {sales.length > 0 ? (
                    <>
                      {new Date(sales[sales.length - 1].createdAt).toLocaleDateString('el-GR')} -
                      {new Date(sales[0].createdAt).toLocaleDateString('el-GR')}
                    </>
                  ) : (
                    'Χωρίς δεδομένα'
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Τρόποι Πληρωμής</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Μετρητά:</span>
                <span className="font-medium">
                  {sales.filter(s => !s.order?.cardDiscountCount).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Κουπόνια:</span>
                <span className="font-medium">
                  {sales.filter(s => s.order?.cardDiscountCount).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Κεράσματα:</span>
                <span className="font-medium">{sales.filter(s => s.isTreat).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
