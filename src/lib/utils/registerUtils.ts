import { CARD_DISCOUNT } from "@/lib/constants";
import type { 
  ListItem, 
  SessionStats, 
  ActiveSessionTotals,
  Order,
  ProductSummary,
  TransactionTotals,
  ExtendedSale
} from '@/types/register';

/**
 * UTILITY FUNCTIONS
 */

/**
 * Calculate statistics for session items
 */
export const calculateStats = (sessions: ListItem[]): SessionStats => sessions.reduce((acc, session) => {
  if (session.type === 'closed') {
    acc.treatsCount += session.treats_count;
    acc.cardCount += session.card_count;
    
    if (session.orders) {
      session.orders.forEach(order => {
        const isCardPayment = Number((order as unknown as { card_discount_count?: number }).card_discount_count) > 0;
        if (isCardPayment) {
          acc.totalCard += Number((order as unknown as { final_amount?: number }).final_amount || 0);
        } else {
          acc.totalCash += Number((order as unknown as { final_amount?: number }).final_amount || 0);
        }
      });
    }
  } else if (session.orders) {
    session.orders.forEach(order => {
      const isCardPayment = Number((order as unknown as { card_discount_count?: number }).card_discount_count) > 0;
      if (isCardPayment) {
        acc.totalCard += Number((order as unknown as { final_amount?: number }).final_amount || 0);
        acc.cardCount += Number((order as unknown as { card_discount_count?: number }).card_discount_count || 0);
      } else {
        acc.totalCash += Number((order as unknown as { final_amount?: number }).final_amount || 0);
      }
      
      order.sales?.forEach(sale => {
        if (sale.isTreat) {
          acc.treatsCount++;
        }
      });
    });
  }
  return acc;
}, {
  totalCash: 0,
  totalCard: 0,
  treatsCount: 0,
  cardCount: 0
});

/**
 * Calculate totals for active sessions
 */
export const calculateActiveSessionTotals = (orders?: Order[]): ActiveSessionTotals => {
  if (!orders) {return {
    totalBeforeDiscounts: 0,
    cardDiscounts: 0,
    treats: 0,
    treatsAmount: 0
  };}

  return orders.reduce((acc, order) => {
    order.sales?.forEach(sale => {
      // No need to check is_deleted - Drizzle only returns active records
      
      if (!sale.isTreat) {
        acc.totalBeforeDiscounts += parseFloat(sale.totalPrice);
      } else {
        acc.treats += sale.quantity;
        acc.treatsAmount += +(parseFloat(sale.unitPrice) * sale.quantity).toFixed(2);
      }
    });
    
    acc.cardDiscounts += order.cardDiscountCount;
    
    return acc;
  }, {
    totalBeforeDiscounts: 0,
    cardDiscounts: 0,
    treats: 0,
    treatsAmount: 0
  });
};

/**
 * Calculate final amount after discounts
 */
export const calculateFinalAmount = (subtotal: number, cardDiscountCount: number): number => {
  const discount = cardDiscountCount * CARD_DISCOUNT;
  return Math.max(0, subtotal - discount);
};

export const calculateProductSummary = (orders?: Order[]): Record<string, ProductSummary> => {
  if (!orders?.length) {return {};}

  const summary = {} as Record<string, ProductSummary>;
  const deletedItems = {} as Record<string, ProductSummary>;

  orders.forEach(({ sales = [] }) => {
    sales.forEach((sale) => {
      if (!sale || !sale.product) {
        // Skip invalid sale entries silently in production
        return;
      }

      const extendedSale = sale as ExtendedSale;
      const { product: { id, name }, quantity, totalPrice, isTreat } = sale;
      
      if (extendedSale.is_deleted) {
        const deletedId = `deleted-${id}-${extendedSale.id}`;
        
        deletedItems[deletedId] = { 
          id: deletedId,
          name,
          originalId: id,
          quantity,
          totalAmount: parseFloat(totalPrice),
          treatCount: isTreat ? quantity : 0,
          isEdited: extendedSale.is_edited || false,
          isDeleted: true,
          originalCode: extendedSale.original_code,
          originalQuantity: extendedSale.original_quantity
        };
        return;
      }
      
      if (!summary[id]) {
        summary[id] = { 
          id, 
          name, 
          originalId: id,
          quantity: 0, 
          totalAmount: 0, 
          treatCount: 0,
          isEdited: false,
          isDeleted: false,
          originalCode: undefined,
          originalQuantity: undefined
        };
      }
      
      summary[id].quantity += quantity;
      summary[id].totalAmount += parseFloat(totalPrice);
      if (isTreat) {summary[id].treatCount += quantity;}
      
      if (extendedSale.is_edited) {
        summary[id].isEdited = true;
        summary[id].originalCode = extendedSale.original_code;
        summary[id].originalQuantity = extendedSale.original_quantity;
      }
    });
  });
  
  return { ...summary, ...deletedItems };
};

export const calculateTransactionTotals = (orders?: Order[]): TransactionTotals => {
  const defaultTotals: TransactionTotals = {
    totalBeforeDiscounts: 0,
    discount: 0,
    cardDiscounts: 0,
    treats: 0,
    treatsAmount: 0
  };

  if (!orders?.length) {return defaultTotals;}

  return orders.reduce((acc, order) => {
    const { sales = [] } = order;
    const cardDiscountCount = order.cardDiscountCount || 0;
    sales.forEach(sale => {
      if (!sale || (sale as ExtendedSale)?.is_deleted) {return;}
      
      if (!sale.isTreat) {
        acc.totalBeforeDiscounts += parseFloat(sale.totalPrice);
      } else {
        acc.treats += sale.quantity;
        acc.treatsAmount += +(parseFloat(sale.unitPrice) * sale.quantity).toFixed(2);
      }
    });
    
    acc.cardDiscounts += cardDiscountCount;
    acc.discount = +(acc.cardDiscounts * CARD_DISCOUNT).toFixed(2);
    
    return acc;
  }, defaultTotals);
}; 