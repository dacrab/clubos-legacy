"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (password: string) => Promise<void>;
  loading: boolean;
}

export default function ResetPasswordDialog({
  open,
  onOpenChange,
  onSubmit,
  loading,
}: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!open) {
      setNewPassword("");
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || loading) {return;}
    await onSubmit(newPassword);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onInteractOutside={(e) => loading && e.preventDefault()}>
        <div className="animate-fade-in">
          <DialogHeader>
            <DialogTitle>Επαναφορά Κωδικού</DialogTitle>
            <DialogDescription>
              Εισάγετε τον νέο κωδικό για τον χρήστη.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Νέος Κωδικός</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Εισάγετε τον νέο κωδικό"
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Ακύρωση
              </Button>
              <Button type="submit" disabled={loading || !newPassword}>
                {loading ? "Επαναφορά..." : "Επαναφορά"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}