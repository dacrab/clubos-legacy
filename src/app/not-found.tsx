'use client';

import Link from 'next/link';

import { DIALOG_MESSAGES } from '@/lib/constants';

export default function NotFound() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="space-y-4 text-center">
        <h2 className="font-bold text-2xl">Σελίδα δεν βρέθηκε</h2>
        <p className="text-muted-foreground">Η σελίδα που ψάχνετε δεν υπάρχει</p>
        <Link
          className="inline-block rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          href="/"
        >
          {DIALOG_MESSAGES.NOT_FOUND_BUTTON}
        </Link>
      </div>
    </div>
  );
}
