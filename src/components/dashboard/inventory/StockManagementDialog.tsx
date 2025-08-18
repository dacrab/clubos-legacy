'use client';

import { useState } from 'react';

import { DIALOG_MESSAGES, STOCK_MESSAGES, UNLIMITED_CATEGORY_ID } from '@/lib/constants';
import { useStockManagement } from '@/hooks/features/inventory/useStockManagement';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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

type StockManagementDialogContentProps = {
  code: NonNullable<StockManagementDialogProps['code']>;
  onOpenChange: (open: boolean) => void;
};

function StockManagementDialogContent({ code, onOpenChange }: StockManagementDialogContentProps) {
  const [stock, setStock] = useState(code.stock.toString());
  const { isLoading, updateStock } = useStockManagement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStock({
      productId: code.id,
      newStock: parseInt(stock),
      reason: 'Manual adjustment',
    });
    onOpenChange(false);
  };

  const isUnlimited = code.category_id === UNLIMITED_CATEGORY_ID;

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Διαχείριση Αποθέματος - {code.code}</DialogTitle>
      </DialogHeader>

      {isUnlimited ? (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">{STOCK_MESSAGES.UNLIMITED_STOCK_NOTE}</p>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>{DIALOG_MESSAGES.CLOSE_BUTTON}</Button>
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
                onChange={e => setStock(e.target.value)}
                min="0"
                required
                disabled={isLoading}
              />
              {isLoading && (
                <LoadingSpinner
                  size="sm"
                  className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2"
                />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              {DIALOG_MESSAGES.CANCEL_BUTTON_DEFAULT}
            </Button>
            <LoadingButton
              type="submit"
              loading={isLoading}
              loadingText={DIALOG_MESSAGES.SAVE_LOADING}
            >
              {DIALOG_MESSAGES.SAVE_BUTTON}
            </LoadingButton>
          </div>
        </form>
      )}
    </DialogContent>
  );
}

export default function StockManagementDialog({
  code,
  open,
  onOpenChange,
}: StockManagementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && code && <StockManagementDialogContent code={code} onOpenChange={onOpenChange} />}
    </Dialog>
  );
}
