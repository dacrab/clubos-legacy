"use client";

import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { transitions } from "@/lib/animations";
import { DIALOG_MESSAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  variant?: "default" | "dashboard" | "root";
  className?: string;
  withSearchParams?: boolean;
  isLoading?: boolean;
  loadingText?: string;
}

function SearchParamsContent({ children }: { children: React.ReactNode }) {
  useSearchParams();
  return children;
}

function LoadingContent({ text = DIALOG_MESSAGES.LOADING_TEXT_DEFAULT }: { text?: string }) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center min-h-[240px] gap-4"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
    >
      <LoadingSpinner size="lg" className="h-12 w-12" />
      <motion.div 
        className="text-muted-foreground text-base"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        {text}
      </motion.div>
    </motion.div>
  );
}

export function PageWrapper({ 
  children, 
  variant = "default", 
  className,
  withSearchParams = false,
  isLoading = false,
  loadingText
}: PageWrapperProps) {
  const baseVariantClass = "min-h-screen bg-background";
  const variants = {
    default: baseVariantClass,
    dashboard: baseVariantClass,
    root: baseVariantClass
  };

  const content = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transitions.smooth}
      className={cn(variants[variant], className)}
    >
      {variant === "default" && (
        <div className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-20 dark:opacity-10 pointer-events-none">
          <div className="blur-[106px] h-56 bg-linear-to-br from-primary to-purple-400 dark:from-blue-700" />
          <div className="blur-[106px] h-32 bg-linear-to-r from-cyan-400 to-sky-300 dark:to-indigo-600" />
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, ...transitions.smooth }}
        className="relative"
      >
        <div className={cn("p-4 xs:p-5 sm:p-6", variant === "dashboard" && "p-3 xs:p-4 sm:p-5 md:p-6")}>
          {isLoading ? (
            <LoadingContent text={loadingText} />
          ) : (
            children
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  if (withSearchParams) {
    return (
      <Suspense fallback={<LoadingContent />}>
        <SearchParamsContent>{content}</SearchParamsContent>
      </Suspense>
    );
  }

  return content;
}