'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useLoading } from '@/components/providers/loading-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { SearchInput } from '@/components/ui/search-input';
import { useProductManagement } from '@/hooks/use-product-management';
import { useSearch } from '@/hooks/use-search';
import { dialogVariants, transitions } from '@/lib/animations';
import { REGISTER_MESSAGES, SALES_MESSAGES } from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase';
import type { Database, PaymentMethodType } from '@/types/supabase';

import { ProductCard } from './components/product-card';

type Code = Database['public']['Tables']['products']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'] | null;
};

// Constants - removed SKELETON_CONFIG as it's now in LoadingSkeleton component

const PRODUCT_ANIMATION_DELAY = 0.05;

// ------------------------------------------------------------
// Type Definitions
// ------------------------------------------------------------

type AddSaleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type NewOrderItem = {
  product: Code | null;
  quantity: number;
  isTreat: boolean;
  paymentMethod: PaymentMethodType;
};

// ------------------------------------------------------------
// Helper Components
// ------------------------------------------------------------

// LoadingSkeleton is now imported from shared components

const AddSaleDialogContent = ({ open, onOpenChange }: AddSaleDialogProps) => {
  const { setIsLoading } = useLoading();
  const router = useRouter();
  const db = createClientSupabase();

  // Use custom hooks
  const { products, loading, fetchProducts } = useProductManagement({
    isAdmin: false,
    autoFetch: false,
  });
  const { searchQuery, handleSearchChange, clearSearch } = useSearch();

  // State
  const [orderItems, setOrderItems] = useState<NewOrderItem[]>([
    {
      product: null,
      quantity: 1,
      isTreat: false,
      paymentMethod: 'cash',
    },
  ]);

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open, fetchProducts]);

  // Filtered products based on search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateOrderItems = (currentOrderItems: NewOrderItem[]): NewOrderItem[] => {
    const validItems = currentOrderItems.filter((item) => item.product && item.quantity > 0);
    if (validItems.length === 0) {
      throw new Error(SALES_MESSAGES.NO_ITEMS);
    }
    return validItems;
  };

  const getActiveSession = async (): Promise<{ id: string }> => {
    const { data: activeSession, error } = await db
      .from('register_sessions')
      .select('id')
      .is('closed_at', null)
      .single();

    if (error) {
      throw new Error(`Σφάλμα ανάκτησης ταμειακής περιόδου: ${error.message}`);
    }

    if (!activeSession) {
      throw new Error(REGISTER_MESSAGES.NO_ACTIVE_SESSION);
    }
    return activeSession;
  };

  const processOrder = async (
    validItems: NewOrderItem[],
    activeSessionId: string,
    userId: string
  ): Promise<void> => {
    const subtotal = validItems.reduce(
      (acc, item) => acc + (item.product?.price ?? 0) * item.quantity,
      0
    );

    // Assuming a single payment method for the whole order, taken from the first item
    const paymentMethod = validItems[0]?.paymentMethod ?? 'cash';

    const orderToInsert: Database['public']['Tables']['orders']['Insert'] = {
      session_id: activeSessionId,
      subtotal,
      discount_amount: 0,
      total_amount: subtotal,
      card_discounts_applied: 0,
      payment_method: paymentMethod,
      created_by: userId,
    };

    const { data: order, error: orderError } = await db
      .from('orders')
      .insert(orderToInsert)
      .select('id')
      .single();

    if (orderError) {
      throw new Error(`Σφάλμα δημιουργίας παραγγελίας: ${orderError.message}`);
    }

    if (!order) {
      throw new Error('Σφάλμα δημιουργίας παραγγελίας - δεν επέστρεψε ID');
    }

    const orderItemsToInsert: Database['public']['Tables']['order_items']['Insert'][] =
      validItems.map((item) => {
        if (!item.product) {
          throw new Error('Μη έγκυρο προϊόν στην παραγγελία');
        }
        const unitPrice = item.product.price;
        const lineTotal = unitPrice * item.quantity;
        return {
          order_id: order.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: unitPrice,
          line_total: lineTotal,
          is_treat: item.isTreat,
        };
      });

    const { error: orderItemsError } = await db.from('order_items').insert(orderItemsToInsert);

    if (orderItemsError) {
      // Compensating action: delete the created order to maintain data consistency
      await db.from('orders').delete().eq('id', order.id);
      throw new Error(`Σφάλμα εισαγωγής στοιχείων παραγγελίας: ${orderItemsError.message}`);
    }
  };

  // Handle payment submission
  const handlePayment = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const validItems = validateOrderItems(orderItems);

      const {
        data: { user },
        error: userError,
      } = await db.auth.getUser();

      if (userError) {
        throw new Error(`Σφάλμα ταυτοποίησης χρήστη: ${userError.message}`);
      }

      if (!user) {
        throw new Error(SALES_MESSAGES.NO_USER_ERROR);
      }

      const activeSession = await getActiveSession();
      await processOrder(validItems, activeSession.id, user.id);

      toast.success(SALES_MESSAGES.CREATE_SUCCESS);
      onOpenChange(false);
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : SALES_MESSAGES.UPDATE_ERROR;
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add product to order
  const handleAddProduct = useCallback((product: Code): void => {
    setOrderItems((prev): NewOrderItem[] => [
      ...prev,
      {
        product,
        quantity: 1,
        isTreat: false,
        paymentMethod: 'cash',
      },
    ]);
  }, []);

  return (
    <motion.div
      animate="visible"
      className="fixed inset-0 z-50 bg-black/50"
      exit="exit"
      initial="hidden"
      variants={dialogVariants.overlay}
    >
      <motion.div
        className="sm:-translate-x-1/2 fixed inset-x-4 top-[10%] rounded-lg bg-card p-6 shadow-lg sm:inset-x-auto sm:top-[20%] sm:left-1/2 sm:w-full sm:max-w-lg"
        variants={dialogVariants.content}
      >
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>Νέα Πώληση</DialogTitle>
            <DialogDescription>Επιλέξτε κωδικούς για προσθήκη στην πώληση</DialogDescription>
          </DialogHeader>

          {loading ? (
            <LoadingSkeleton className="h-10 w-full rounded-md bg-muted/50" count={4} />
          ) : (
            <>
              <SearchInput
                onChange={handleSearchChange}
                onClear={clearSearch}
                placeholder="Αναζήτηση κωδικού..."
                value={searchQuery}
              />

              <div className="relative min-h-[200px]">
                <AnimatePresence mode="popLayout">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        animate={{
                          opacity: 1,
                          x: 0,
                          transition: {
                            delay: index * PRODUCT_ANIMATION_DELAY,
                            type: 'spring',
                            stiffness: 300,
                            damping: 30,
                          },
                        }}
                        exit={{ opacity: 0, x: 20 }}
                        initial={{ opacity: 0, x: -20 }}
                        key={product.id}
                      >
                        <ProductCard onClick={handleAddProduct} product={product} />
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>

                {!filteredProducts.length && (
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center text-muted-foreground"
                    initial={{ opacity: 0 }}
                    transition={transitions.smooth}
                  >
                    Δεν βρέθηκαν προϊόντα
                  </motion.div>
                )}
              </div>
            </>
          )}

          <DialogFooter>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Ακύρωση
            </Button>
            <Button disabled={!orderItems.some((item) => item.product)} onClick={handlePayment}>
              Ολοκλήρωση
            </Button>
          </DialogFooter>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default function AddSaleDialog({ open, onOpenChange }: AddSaleDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <AnimatePresence>
        {open && <AddSaleDialogContent onOpenChange={onOpenChange} open={open} />}
      </AnimatePresence>
    </Dialog>
  );
}
