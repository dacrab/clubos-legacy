'use client';

import { createBrowserClient } from '@supabase/ssr';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

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
import { transitions } from '@/lib/animations';
import { USER_MESSAGES } from '@/lib/constants';
import type { Database } from '@/types/supabase';

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
  const supabase = useMemo(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (error) {
        throw error;
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
