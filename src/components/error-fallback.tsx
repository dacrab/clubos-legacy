import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function ErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
      <div className="text-destructive">Παρουσιάστηκε σφάλμα κατά τη φόρτωση της εφαρμογής</div>
      <Link href="/">
        <Button variant="outline" size="sm">
          Επιστροφή στην αρχική
        </Button>
      </Link>
    </div>
  );
}
