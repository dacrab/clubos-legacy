import type { 
  DatabaseRegisterSession,
  RegisterSessionWithClosings, 
  ListItem, 
  SessionStats, 
  ActiveSessionTotals,
  Order,
  ProductSummary,
  TransactionTotals,
  ExtendedSale,
  Sale
} from '@/types/register';
import { CARD_DISCOUNT } from "@/lib/constants";

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
        const isCardPayment = order.card_discount_count > 0;
        if (isCardPayment) {
          acc.totalCard += order.final_amount;
        } else {
          acc.totalCash += order.final_amount;
        }
      });
    }
  } else if (session.orders) {
    session.orders.forEach(order => {
      const isCardPayment = order.card_discount_count > 0;
      if (isCardPayment) {
        acc.totalCard += order.final_amount;
        acc.cardCount += order.card_discount_count;
      } else {
        acc.totalCash += order.final_amount;
      }
      
      order.sales?.forEach(sale => {
        if (sale.is_treat) {
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
  if (!orders) return {
    totalBeforeDiscounts: 0,
    cardDiscounts: 0,
    treats: 0,
    treatsAmount: 0
  };

  return orders.reduce((acc, order) => {
    order.sales?.forEach(sale => {
      if ((sale as ExtendedSale).is_deleted) return;
      
      if (!sale.is_treat) {
        acc.totalBeforeDiscounts += sale.total_price;
      } else {
        acc.treats += sale.quantity;
        acc.treatsAmount += +(sale.unit_price * sale.quantity).toFixed(2);
      }
    });
    
    acc.cardDiscounts += order.card_discount_count;
    
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
  if (!orders?.length) return {};

  const summary = {} as Record<string, ProductSummary>;
  const deletedItems = {} as Record<string, ProductSummary>;

  orders.forEach(({ sales = [] }) => {
    sales.forEach((sale) => {
      const extendedSale = sale as ExtendedSale;
      const { product: { id, name }, quantity, total_price, is_treat } = sale;
      
      if (extendedSale.is_deleted) {
        const deletedId = `deleted-${id}-${extendedSale.id}`;
        
        deletedItems[deletedId] = { 
          id: deletedId,
          name,
          originalId: id,
          quantity,
          totalAmount: total_price,
          treatCount: is_treat ? quantity : 0,
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
      summary[id].totalAmount += total_price;
      if (is_treat) summary[id].treatCount += quantity;
      
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

  if (!orders?.length) return defaultTotals;

  return orders.reduce((acc, { sales = [], card_discount_count = 0 }) => {
    sales.forEach(sale => {
      if ((sale as ExtendedSale)?.is_deleted) return;
      
      if (!sale.is_treat) {
        acc.totalBeforeDiscounts += sale.total_price;
      } else {
        acc.treats += sale.quantity;
        acc.treatsAmount += +(sale.unit_price * sale.quantity).toFixed(2);
      }
    });
    
    acc.cardDiscounts += card_discount_count;
    acc.discount = +(acc.cardDiscounts * CARD_DISCOUNT).toFixed(2);
    
    return acc;
  }, defaultTotals);
}; 