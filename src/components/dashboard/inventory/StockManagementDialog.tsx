"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Database } from "@/types/supabase";
import { STOCK_MESSAGES, DIALOG_MESSAGES, CODE_MESSAGES, UNLIMITED_CATEGORY_ID } from "@/lib/constants";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type StockManagementDialogProps = {
  code: {
    id: string;
    code: string;
    stock: number;
    category_id?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function StockManagementDialog({ code, open, onOpenChange }: StockManagementDialogProps) {
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (code) setStock(code.stock.toString());
  }, [code]);

  if (!code) return null;

  const isUnlimited = code.category_id === UNLIMITED_CATEGORY_ID;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('codes')
        .update({ stock: parseInt(stock) })
        .eq('id', code.id);

      if (error) throw error;

      toast.success(STOCK_MESSAGES.UPDATE_SUCCESS);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      toast.error(CODE_MESSAGES.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Διαχείριση Αποθέματος - {code.code}</DialogTitle>
        </DialogHeader>

        {isUnlimited ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {STOCK_MESSAGES.UNLIMITED_STOCK_NOTE}
            </p>
            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>
                {DIALOG_MESSAGES.CLOSE_BUTTON}
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{STOCK_MESSAGES.NEW_STOCK_LABEL}</label>
              <div className="relative">
                <Input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  min="0"
                  required
                  disabled={loading}
                />
                {loading && (
                  <LoadingSpinner 
                    size="sm" 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
                  />
                )}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                {DIALOG_MESSAGES.CANCEL_BUTTON_DEFAULT}
              </Button>
              <LoadingButton 
                type="submit" 
                loading={loading}
                loadingText={DIALOG_MESSAGES.SAVE_LOADING}
              >
                {DIALOG_MESSAGES.SAVE_BUTTON}
              </LoadingButton>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}