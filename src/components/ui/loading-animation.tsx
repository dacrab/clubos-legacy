'use client';

import { motion } from 'framer-motion';
import { Coffee } from 'lucide-react';

import { loadingVariants, transitions } from '@/lib/animations';
import { cn } from '@/lib/utils/format';

export function LoadingAnimation({ className }: { className?: string }) {
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs',
        className
      )}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={transitions.smooth}
    >
      <div className="relative flex flex-col items-center gap-2">
        <motion.div animate="animate" initial="initial" variants={loadingVariants.icon}>
          <Coffee className="h-8 w-8 text-primary" />
        </motion.div>
        <motion.div
          animate="animate"
          className="h-1 w-24 overflow-hidden rounded-full bg-primary/20"
          initial="initial"
          variants={loadingVariants.bar}
        >
          <motion.div
            animate="animate"
            className="h-full w-full bg-primary"
            initial="initial"
            variants={loadingVariants.progress}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
