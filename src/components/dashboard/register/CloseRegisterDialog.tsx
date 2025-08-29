import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { Textarea } from "@/components/ui/textarea";
import { REGISTER_MESSAGES, API_ERROR_MESSAGES } from "@/lib/constants";
import { createClientSupabase } from "@/lib/supabase";

interface CloseRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisterClosed?: () => void;
}

export default function CloseRegisterDialog({ open, onOpenChange, onRegisterClosed }: CloseRegisterDialogProps) {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [closedByName, setClosedByName] = useState("");
  const router = useRouter();
  const supabase = createClientSupabase() as any;

  const getActiveRegisterSession = useCallback(async () => {
    try {
      const { data: session, error } = await supabase
        .from('register_sessions')
        .select('*')
        .is('closed_at', null)
        .order('opened_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching active register session:', error.message);
        toast.error('Error fetching active register session: ' + error.message);
        return null;
      }

      if (!session) {
        toast.error('No active register session found. Please open a register session first.');
        return null;
      }

      return session;
    } catch (error) {
      console.error('Unexpected error in getActiveRegisterSession:', error);
      toast.error(API_ERROR_MESSAGES.GENERIC_ERROR);
      return null;
    }
  }, [supabase]);

  useEffect(() => {
    if (!open) {
      setNotes("");
      setClosedByName("");
      setLoading(false);
      return;
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      if (!closedByName.trim()) {
        toast.error("Παρακαλώ εισάγετε το όνομά σας");
        return;
      }

      setLoading(true);

      const activeSession = await getActiveRegisterSession();
      if (!activeSession) {
        toast.error(API_ERROR_MESSAGES.GENERIC_ERROR);
        return;
      }

      const closeResult = await supabase
        .rpc('close_register', { 
          p_register_session_id: activeSession.id,
          p_closed_by_name: closedByName,
          p_notes: notes ? { text: notes } : null
        });

      if (closeResult.error) {
        console.error('Error closing register:', closeResult.error);
        toast.error(closeResult.error.message || REGISTER_MESSAGES.CLOSE_ERROR);
        return;
      }

      toast.success(REGISTER_MESSAGES.CLOSE_SUCCESS);
      void router.refresh();
      onOpenChange(false);
      onRegisterClosed?.();

    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error(API_ERROR_MESSAGES.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Κλείσιμο Ταμείου</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="closedByName" className="font-medium">
              Όνομα <span className="text-red-500">*</span>
            </Label>
            <Input
              id="closedByName"
              placeholder="Εισάγετε το όνομά σας..."
              value={closedByName}
              onChange={(e) => setClosedByName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Σημειώσεις</Label>
            <Textarea
              id="notes"
              placeholder="Προαιρετικές σημειώσεις για το κλείσιμο..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <LoadingButton 
          loading={loading}
          onClick={handleSubmit}
          className="w-full mt-4"
        >
          Κλείσιμο Ταμείου
        </LoadingButton>
      </DialogContent>
    </Dialog>
  );
}