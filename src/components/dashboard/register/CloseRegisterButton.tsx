"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/lib/auth-client";
import { logger } from "@/lib/utils/logger";

interface CloseRegisterButtonProps {
  onRegisterClosed?: () => void;
}

export function CloseRegisterButton({ onRegisterClosed }: CloseRegisterButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [closingCash, setClosingCash] = useState("");
  const [notes, setNotes] = useState("");
  const [activeSession, setActiveSession] = useState<{ id: string; openedAt: string; openedBy?: { username?: string } } | null>(null);
  const [expectedCash, setExpectedCash] = useState(0);
  const router = useRouter();
  useUser();

  const fetchActiveSession = useCallback(async () => {
    try {
      const response = await fetch('/api/register-sessions/active');
      if (response.ok) {
        const session = await response.json();
        setActiveSession(session);
        // Calculate expected cash from sales in this session
        await calculateExpectedCash(session.id);
      }
    } catch (error) {
      logger.error('Error fetching active session:', error);
    }
  }, []);

  // Fetch active register session when dialog opens
  useEffect(() => {
    if (open) {
      fetchActiveSession();
    }
  }, [open, fetchActiveSession]);

  const calculateExpectedCash = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/register-sessions/${sessionId}/summary`);
      if (response.ok) {
        const summary = await response.json();
        setExpectedCash(summary.expectedCash || 0);
      }
    } catch (error) {
      logger.error('Error calculating expected cash:', error);
    }
  };

  const handleClose = async () => {
    if (!activeSession) {
      toast.error("Δεν υπάρχει ενεργή συνεδρία ταμείου");
      return;
    }

    if (!closingCash.trim()) {
      toast.error("Παρακαλώ εισάγετε το ποσό κλεισίματος");
      return;
    }

    setLoading(true);

    try {
      const closingAmount = parseFloat(closingCash);
      const cashDifference = closingAmount - expectedCash;

      const response = await fetch(`/api/register-sessions/${activeSession.id}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          closingCash: closingAmount,
          expectedCash,
          cashDifference,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to close register');
      }

      toast.success("Το ταμείο έκλεισε επιτυχώς");
      setOpen(false);
      onRegisterClosed?.();
      
      // Reset form
      setClosingCash("");
      setNotes("");
      setActiveSession(null);
      
      // Redirect to register closings page
      router.push('/dashboard/register-closings');
    } catch (error) {
      logger.error('Error closing register:', error);
      toast.error(error instanceof Error ? error.message : "Σφάλμα κατά το κλείσιμο του ταμείου");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        variant="destructive"
        className="w-full"
      >
        Κλείσιμο Ταμείου
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Κλείσιμο Ταμείου</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {activeSession && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium">Ενεργή Συνεδρία:</p>
                <p className="text-sm text-muted-foreground">
                  Άνοιξε: {new Date(activeSession.openedAt).toLocaleString('el-GR')}
                </p>
                <p className="text-sm text-muted-foreground">
                  Από: {activeSession.openedBy?.username || 'Άγνωστος'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Αναμενόμενο Ποσό</Label>
                <Input
                  value={`€${expectedCash.toFixed(2)}`}
                  disabled
                  className="bg-muted"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="closingCash">
                  Ποσό Κλεισίματος <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="closingCash"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                />
              </div>
            </div>

            {closingCash && expectedCash > 0 && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium">
                  Διαφορά: 
                  <span className={`ml-1 ${
                    (parseFloat(closingCash) - expectedCash) >= 0 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    €{(parseFloat(closingCash) - expectedCash).toFixed(2)}
                  </span>
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="notes">Σημειώσεις</Label>
              <Textarea
                id="notes"
                placeholder="Προαιρετικές σημειώσεις..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <LoadingButton 
            loading={loading}
            onClick={handleClose}
            className="w-full mt-4"
          >
            Κλείσιμο Ταμείου
          </LoadingButton>
        </DialogContent>
      </Dialog>
    </>
  );
} 