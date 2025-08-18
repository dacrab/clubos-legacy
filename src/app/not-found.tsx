import Link from 'next/link';

import { DIALOG_MESSAGES } from '@/lib/constants';

export default function NotFound() {
  return (
    <div className="bg-background flex h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-bold">Σελίδα δεν βρέθηκε</h2>
        <p className="text-muted-foreground">Η σελίδα που ψάχνετε δεν υπάρχει</p>
        <Link
          href="/"
          className="bg-primary text-primary-foreground hover:bg-primary/90 inline-block rounded-md px-4 py-2"
        >
          {DIALOG_MESSAGES.NOT_FOUND_BUTTON}
        </Link>
      </div>
    </div>
  );
}
