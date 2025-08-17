import { notFound } from 'next/navigation';


import AddSaleButton from "@/components/dashboard/sales/AddSaleButton";
import NewSaleInterface from "@/components/dashboard/sales/NewSaleInterface";
import AdminDashboard from '@/components/dashboard/views/AdminDashboard';
import EmployeeDashboard from '@/components/dashboard/views/EmployeeDashboard';
import SecretariatDashboard from '@/components/dashboard/views/SecretariatDashboard';
import { stackServerApp } from '@/lib/auth';
import { getLowStockProducts } from '@/lib/db/services/products';
import { getRecentOrders } from '@/lib/db/services/sales';
import { getUserById } from '@/lib/db/services/users';
import type { Product } from '@/types/products';
import type { SaleWithDetails, Order } from '@/types/sales';
import { logger } from '@/lib/utils/logger';

// Type for the order data returned from the database query
interface DatabaseOrder {
  id: string;
  orderNumber: string;
  registerSessionId: string;
  customerName?: string | null;
  subtotal?: string;
  taxAmount?: string;
  discountAmount?: string;
  totalAmount?: string;
  finalAmount: string;
  paymentMethod: 'cash' | 'card' | 'treat';
  cardDiscountCount: number;
  isVoided: boolean;
  voidReason?: string | null;
  createdAt: Date;
  createdBy: string;
  voidedAt?: Date | null;
  voidedBy?: string | null;
  sales: Array<{
    id: string;
    orderId: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    isTreat: boolean;
    isVoided: boolean;
    voidReason?: string | null;
    createdAt: Date;
    voidedAt?: Date | null;
    voidedBy?: string | null;
    product: Product;
  }>;
}

// This function can be moved to a utils file if it's used elsewhere
const transformOrderToSales = (order: DatabaseOrder): SaleWithDetails[] => {
  // Create the order object that matches the Order type
  const orderData: Order = {
    id: order.id,
    orderNumber: order.orderNumber,
    registerSessionId: order.registerSessionId,
    customerName: order.customerName,
    subtotal: order.subtotal || '0',
    taxAmount: order.taxAmount || '0',
    discountAmount: order.discountAmount || '0',
    totalAmount: order.totalAmount || '0',
    finalAmount: order.finalAmount,
    paymentMethod: order.paymentMethod,
    cardDiscountCount: order.cardDiscountCount,
    isVoided: order.isVoided,
    voidReason: order.voidReason,
    createdAt: order.createdAt,
    createdBy: order.createdBy,
    voidedAt: order.voidedAt,
    voidedBy: order.voidedBy,
  };

  return order.sales.map((sale) => ({
    ...sale,
    order: orderData,
  }));
};

export default async function DashboardPage() {
  const user = await stackServerApp.getUser();

  if (!user) {
    return notFound();
  }

  const profile = await getUserById(user.id);

  if (!profile) {
    return notFound();
  }

  // Common data for all roles
  try {
    const recentOrders = await getRecentOrders(5);
    const recentSales = recentOrders?.flatMap(transformOrderToSales) || [];

    // Role-specific data and component rendering
    switch (profile.role) {
      case 'admin': {
        const lowStock = await getLowStockProducts();

        return (
          <AdminDashboard 
            recentSales={recentSales} 
            lowStock={lowStock as Product[]} 
          />
        );
      }
      case 'employee':
        return <EmployeeDashboard recentSales={recentSales} />;
      case 'secretary':
        return <SecretariatDashboard />;
      default:
        return (
          <div className="flex flex-col flex-1 bg-background p-4 sm:p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold tracking-tight">Πωλήσεις</h1>
                <AddSaleButton />
              </div>
              <NewSaleInterface open={false} onOpenChange={() => {}} />
            </div>
          </div>
        );
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error("Error fetching dashboard data:", error);
    }
    return notFound();
  }
}