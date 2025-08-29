"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import CloseRegisterDialog from "./CloseRegisterDialog";

interface CloseRegisterButtonProps {
  onRegisterClosed?: () => void;
}

export function CloseRegisterButton({ onRegisterClosed }: CloseRegisterButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        variant="destructive"
        className="w-full"
        aria-label="Κλείσιμο Ταμείου"
        aria-haspopup="dialog"
      >
        Κλείσιμο Ταμείου
      </Button>

      <CloseRegisterDialog 
        open={open} 
        onOpenChange={setOpen} 
        onRegisterClosed={onRegisterClosed}
      />
    </>
  );
} 