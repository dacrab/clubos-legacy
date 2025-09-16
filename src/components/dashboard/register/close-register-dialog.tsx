import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { Textarea } from '@/components/ui/textarea';
import { API_ERROR_MESSAGES, REGISTER_MESSAGES } from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase';

type CloseRegisterDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisterClosed?: () => void;
};

export default function CloseRegisterDialog({
  open,
  onOpenChange,
  onRegisterClosed,
}: CloseRegisterDialogProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [closedByName, setClosedByName] = useState('');
  const router = useRouter();
  const supabase = createClientSupabase();

  const getActiveRegisterSession = useCallback(async () => {
    try {
      const { data: session, error } = await supabase
        .from('register_sessions')
        .select('id')
        .is('closed_at', null)
        .single();

      if (error) {
        toast.error(`Error fetching active register session: ${error.message}`);
        return null;
      }

      if (!session) {
        toast.error(REGISTER_MESSAGES.NO_ACTIVE_SESSION);
        return null;
      }
      return session;
    } catch (_error) {
      toast.error(API_ERROR_MESSAGES.GENERIC_ERROR);
      return null;
    }
  }, [supabase]);

  useEffect(() => {
    if (!open) {
      setNotes('');
      setClosedByName('');
      setLoading(false);
      return;
    }
  }, [open]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const session = await getActiveRegisterSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const closeResult = await supabase.rpc('close_register_session', {
        p_session_id: session.id,
        p_notes: {
          notes,
          closed_by_name: closedByName,
        },
      });

      if (closeResult.error) {
        toast.error(closeResult.error.message || REGISTER_MESSAGES.CLOSE_ERROR);
        return;
      }

      toast.success(REGISTER_MESSAGES.CLOSE_SUCCESS);
      router.refresh();
      onOpenChange(false);
      onRegisterClosed?.();
    } catch (_error) {
      toast.error(API_ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Κλείσιμο Ταμείου</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-medium" htmlFor="closedByName">
              Όνομα <span className="text-red-500">*</span>
            </Label>
            <Input
              id="closedByName"
              onChange={(e) => setClosedByName(e.target.value)}
              placeholder="Εισάγετε το όνομά σας..."
              required
              value={closedByName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Σημειώσεις</Label>
            <Textarea
              id="notes"
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Προαιρετικές σημειώσεις για το κλείσιμο..."
              value={notes}
            />
          </div>
        </div>

        <LoadingButton className="mt-4 w-full" loading={loading} onClick={handleSubmit}>
          Κλείσιμο Ταμείου
        </LoadingButton>
      </DialogContent>
    </Dialog>
  );
}
