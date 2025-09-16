'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

import { pageVariants, transitions } from '@/lib/animations';

export default function AnimatedContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        animate="animate"
        exit="exit"
        initial="initial"
        key={pathname}
        transition={transitions.smooth}
        variants={pageVariants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
