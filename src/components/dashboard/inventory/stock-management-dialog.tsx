'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  DIALOG_MESSAGES,
  PRODUCT_MESSAGES,
  STOCK_MESSAGES,
  UNLIMITED_STOCK,
} from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase/client';
import { toast } from '@/lib/utils/toast';

type StockManagementDialogProps = {
  code: {
    id: string;
    name: string;
    stock_quantity: number;
    category_id?: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function StockManagementDialog({
  code,
  open,
  onOpenChange,
}: StockManagementDialogProps) {
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClientSupabase();

  useEffect(() => {
    if (code) {
      setStock(code.stock_quantity.toString());
    }
  }, [code]);

  if (!code) {
    return null;
  }

  const isUnlimited = code.stock_quantity === UNLIMITED_STOCK;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: Number.parseInt(stock, 10) })
        .eq('id', code.id);

      if (error) {
        throw error;
      }

      toast.success(PRODUCT_MESSAGES.UPDATE_SUCCESS);
      onOpenChange(false);
      router.refresh();
    } catch (_error) {
      toast.error(PRODUCT_MESSAGES.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Διαχείριση Αποθέματος - {code.name}</DialogTitle>
        </DialogHeader>

        {isUnlimited ? (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">{STOCK_MESSAGES.UNLIMITED_STOCK_NOTE}</p>
            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>{DIALOG_MESSAGES.CLOSE_BUTTON}</Button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="font-medium text-sm" htmlFor="stock">
                {STOCK_MESSAGES.NEW_STOCK_LABEL}
              </Label>
              <div className="relative">
                <Input
                  disabled={loading}
                  id="stock"
                  min="0"
                  onChange={(e) => setStock(e.target.value)}
                  required
                  type="number"
                  value={stock}
                />
                {loading && (
                  <LoadingSpinner
                    className="-translate-y-1/2 absolute top-1/2 right-3 text-muted-foreground"
                    size="sm"
                  />
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button disabled={loading} onClick={() => onOpenChange(false)} variant="outline">
                {DIALOG_MESSAGES.CANCEL_BUTTON_DEFAULT}
              </Button>
              <LoadingButton
                loading={loading}
                loadingText={DIALOG_MESSAGES.SAVE_LOADING}
                type="submit"
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
