import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DIALOG_MESSAGES } from '@/lib/constants';

type ConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  loading?: boolean;
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  loading = false,
}: ConfirmationDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button disabled={loading} onClick={() => onOpenChange(false)} variant="outline">
            {DIALOG_MESSAGES.CANCEL_BUTTON_DEFAULT}
          </Button>
          <Button
            className="flex items-center gap-2"
            disabled={loading}
            onClick={onConfirm}
            variant="destructive"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? DIALOG_MESSAGES.DELETE_LOADING : DIALOG_MESSAGES.DELETE_BUTTON}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
