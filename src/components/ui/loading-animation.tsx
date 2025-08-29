"use client";

import { motion } from "framer-motion";
import { Coffee } from "lucide-react";

import { loadingVariants, transitions } from "@/lib/animations";
import { cn } from "@/lib/utils";

export function LoadingAnimation({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transitions.smooth}
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs",
        className
      )}
    >
      <div className="relative flex flex-col items-center gap-2">
        <motion.div
          variants={loadingVariants.icon}
          initial="initial"
          animate="animate"
        >
          <Coffee className="h-8 w-8 text-primary" />
        </motion.div>
        <motion.div
          variants={loadingVariants.bar}
          initial="initial"
          animate="animate"
          className="h-1 bg-primary/20 rounded-full overflow-hidden w-24"
        >
          <motion.div
            variants={loadingVariants.progress}
            initial="initial"
            animate="animate"
            className="h-full w-full bg-primary"
          />
        </motion.div>
      </div>
    </motion.div>
  );
} 