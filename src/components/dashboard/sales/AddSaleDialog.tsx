"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database } from "@/types/supabase";
import { toast } from 'sonner';
import { Search, Euro } from "lucide-react";
import { PAYMENT_METHOD_LABELS, SALES_MESSAGES, UNLIMITED_STOCK } from "@/lib/constants";
import { useLoading } from "@/components/providers/loading-provider";
import { motion, AnimatePresence } from "framer-motion";
import { dialogVariants, transitions } from "@/lib/animations";

// ------------------------------------------------------------
// Type Definitions
// ------------------------------------------------------------

interface AddSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Code = Database["public"]["Tables"]["codes"]["Row"] & {
  category: { name: string; id: string } | null;
};

type OrderItem = {
  code: Code | null;
  quantity: number;
  isTreat: boolean;
  paymentMethod: keyof typeof PAYMENT_METHOD_LABELS;
};

// ------------------------------------------------------------
// Helper Components
// ------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <motion.div 
        className="h-4 w-48 rounded bg-muted/50"
        animate={{ opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="h-10 w-full rounded-md bg-muted/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, ...transitions.smooth }}
          />
        ))}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Main Component
// ------------------------------------------------------------

export default function AddSaleDialog({ open, onOpenChange }: AddSaleDialogProps) {
  const { setIsLoading } = useLoading();
  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // State
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([{ 
    code: null, 
    quantity: 1, 
    isTreat: false, 
    paymentMethod: 'cash' 
  }]);
  const [searchQuery, setSearchQuery] = useState("");

  // Data fetching
  const fetchCodes = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('codes')
        .select('*, category:categories (name, id)')
        .or('stock.gt.0,stock.eq.-1')
        .order('name');

      if (error) throw error;
      setCodes(data || []);
    } catch (error) {
      toast.error("Σφάλμα φόρτωσης προϊόντων");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (open) fetchCodes();
  }, [open, fetchCodes]);

  // Filtered codes based on search query
  const filteredCodes = codes.filter(code => 
    code.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle payment submission
  const handlePayment = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const validItems = orderItems.filter(item => item.code);
      if (!validItems.length) throw new Error("Δεν έχουν επιλεγεί προϊόντα");

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(SALES_MESSAGES.NO_USER_ERROR);

      // Get active register session
      const { data: activeSession } = await supabase
        .from('register_sessions')
        .select('id')
        .is('closed_at', null)
        .single();

      if (!activeSession) {
        throw new Error("Δεν υπάρχει ενεργή ταμειακή περίοδος");
      }

      // Process each item in the order
      for (const item of validItems) {
        const { data: currentStock } = await supabase
          .from('codes')
          .select('stock')
          .eq('id', item.code!.id)
          .single();

        if (currentStock?.stock !== UNLIMITED_STOCK && currentStock?.stock < item.quantity) {
          throw new Error(`Δεν υπάρχει διαθέσιμο stock για το προϊόν ${item.code!.name}`);
        }

        const unitPrice = item.code!.price;
        const totalPrice = unitPrice * item.quantity;
        const discountAmount = 0; // You can add discount logic here
        const finalPrice = totalPrice - discountAmount;

        // Create sale record
        await supabase.from('sales').insert({
          register_session_id: activeSession.id,
          code_id: item.code!.id,
          quantity: item.quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          discount_amount: discountAmount,
          final_price: finalPrice,
          is_treat: item.isTreat,
          payment_method: item.paymentMethod,
          sold_by: user.id,
          coffee_options: null,
          is_edited: false,
          is_deleted: false
        });

        // Update stock if not unlimited
        if (currentStock?.stock !== UNLIMITED_STOCK) {
          await supabase
            .from('codes')
            .update({ stock: currentStock!.stock - item.quantity })
            .eq('id', item.code!.id);
        }
      }

      toast.success(SALES_MESSAGES.CREATE_SUCCESS);
      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || SALES_MESSAGES.UPDATE_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  // Add product to order
  const handleAddProduct = useCallback((code: Code): void => {
    setOrderItems(prev => [...prev, { 
      code, 
      quantity: 1, 
      isTreat: false, 
      paymentMethod: 'cash' 
    }]);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <motion.div
        variants={dialogVariants.overlay}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black/50 z-50"
      >
        <motion.div
          variants={dialogVariants.content}
          className="fixed inset-x-4 top-[10%] sm:top-[20%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg bg-card p-6 rounded-lg shadow-lg"
        >
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Νέα Πώληση</DialogTitle>
              <DialogDescription>
                Επιλέξτε κωδικούς για προσθήκη στην πώληση
              </DialogDescription>
            </DialogHeader>
          
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Αναζήτηση κωδικού..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="relative min-h-[200px]">
                  <AnimatePresence mode="popLayout">
                    {filteredCodes.map((code, index) => (
                      <motion.div
                        key={code.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ 
                          opacity: 1, 
                          x: 0,
                          transition: {
                            delay: index * 0.05,
                            type: "spring",
                            stiffness: 300,
                            damping: 30
                          }
                        }}
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <Button
                          variant="outline"
                          className="w-full justify-between p-3 h-auto text-base mb-2"
                          onClick={() => handleAddProduct(code)}
                        >
                          <span>{code.name}</span>
                          <span className="flex items-center gap-1 text-lg">
                            <Euro className="h-4 w-4" />
                            {code.price.toFixed(2)}
                          </span>
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {!filteredCodes.length && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={transitions.smooth}
                      className="absolute inset-0 flex items-center justify-center text-muted-foreground"
                    >
                      Δεν βρέθηκαν κωδικοί
                    </motion.div>
                  )}
                </div>
              </>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Ακύρωση
              </Button>
              <Button onClick={handlePayment} disabled={!orderItems.some(item => item.code)}>
                Ολοκλήρωση
              </Button>
            </DialogFooter>
          </div>
        </motion.div>
      </motion.div>
    </Dialog>
  );
}