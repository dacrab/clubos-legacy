import Link from "next/link";

import { DIALOG_MESSAGES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Σελίδα δεν βρέθηκε</h2>
        <p className="text-muted-foreground">Η σελίδα που ψάχνετε δεν υπάρχει</p>
        <Link 
          href="/"
          className="inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {DIALOG_MESSAGES.NOT_FOUND_BUTTON}
        </Link>
      </div>
    </div>
  );
}