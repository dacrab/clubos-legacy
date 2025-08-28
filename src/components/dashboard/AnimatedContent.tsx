"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { pageVariants, transitions } from "@/lib/animations";

export default function AnimatedContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transitions.smooth}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}