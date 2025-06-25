"use client";

import { Button } from "@/components/ui/button";

export function ErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="text-destructive">
        Παρουσιάστηκε σφάλμα κατά τη φόρτωση της εφαρμογής
      </div>
      <Button 
        onClick={() => window.location.reload()}
        variant="outline"
        size="sm"
      >
        Ανανέωση
      </Button>
    </div>
  );
} 