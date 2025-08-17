import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="text-destructive">
        Παρουσιάστηκε σφάλμα κατά τη φόρτωση της εφαρμογής
      </div>
      <Link href="/">
        <Button variant="outline" size="sm">
          Επιστροφή στην αρχική
        </Button>
      </Link>
    </div>
  );
} 