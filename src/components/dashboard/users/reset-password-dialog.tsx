'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { USER_MESSAGES } from '@/lib/constants';
import { transitions } from '@/lib/utils/animations';
import { toast } from '@/lib/utils/toast';

type ResetPasswordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
};

export default function ResetPasswordDialog({
  open,
  onOpenChange,
  userId,
}: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) {
        throw new Error('Failed to reset password');
      }

      toast.success(USER_MESSAGES.PASSWORD_RESET_SUCCESS);
      onOpenChange(false);
      setNewPassword('');
    } catch (_error) {
      toast.error(USER_MESSAGES.UNEXPECTED_ERROR);
    }

    setLoading(false);
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          transition={transitions.smooth}
        >
          <DialogHeader>
            <DialogTitle>Επαναφορά Κωδικού</DialogTitle>
            <DialogDescription>Εισάγετε τον νέο κωδικό για τον χρήστη.</DialogDescription>
          </DialogHeader>

          <form className="space-y-4 py-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Νέος Κωδικός</Label>
              <Input
                id="newPassword"
                minLength={6}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Εισάγετε τον νέο κωδικό"
                required
                type="password"
                value={newPassword}
              />
            </div>

            <DialogFooter>
              <Button
                disabled={loading}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Ακύρωση
              </Button>
              <Button disabled={loading || !userId} type="submit">
                {loading ? 'Επαναφορά...' : 'Επαναφορά'}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
