"use client";

import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { DIALOG_MESSAGES } from "@/lib/constants";
import { transitions } from "@/lib/animations";

export function LoadingFallback({ variant = "default" }: { variant?: "default" | "card" | "table" }) {
  const [showTimeout, setShowTimeout] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  if (showTimeout) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center min-h-[200px] space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={transitions.smooth}
      >
        <div className="text-muted-foreground">
          Παρουσιάστηκε πρόβλημα κατά τη φόρτωση. Παρακαλώ ανανεώστε τη σελίδα.
        </div>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
        >
          Ανανέωση
        </Button>
      </motion.div>
    );
  }

  if (variant === "card") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-[200px] w-full rounded-lg bg-muted/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, ...transitions.smooth }}
          />
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <motion.div 
            className="h-4 w-32 rounded bg-muted/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 0.3, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div 
            className="h-4 w-24 rounded bg-muted/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 0.3, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
          />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-4 w-full rounded bg-muted/50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, ...transitions.smooth }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <motion.div 
        className="h-4 w-48 rounded bg-muted/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.div 
        className="h-4 w-32 rounded bg-muted/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
      />
    </div>
  );
} 