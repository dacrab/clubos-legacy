'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';

import CloseRegisterDialog from './close-register-dialog';

type CloseRegisterButtonProps = {
  onRegisterClosed?: () => void;
};

export function CloseRegisterButton({ onRegisterClosed }: CloseRegisterButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        aria-haspopup="dialog"
        aria-label="Κλείσιμο Ταμείου"
        className="w-full"
        onClick={() => setOpen(true)}
        variant="destructive"
      >
        Κλείσιμο Ταμείου
      </Button>

      <CloseRegisterDialog
        onOpenChange={setOpen}
        open={open}
        {...(onRegisterClosed ? { onRegisterClosed } : {})}
      />
    </>
  );
}
