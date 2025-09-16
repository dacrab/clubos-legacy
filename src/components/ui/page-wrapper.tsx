'use client';

import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { transitions } from '@/lib/animations';
import { DIALOG_MESSAGES } from '@/lib/constants';
import { cn } from '@/lib/utils/format';

type PageWrapperProps = {
  children: React.ReactNode;
  variant?: 'default' | 'dashboard' | 'root';
  className?: string;
  withSearchParams?: boolean;
  isLoading?: boolean;
  loadingText?: string;
};

function SearchParamsContent({ children }: { children: React.ReactNode }) {
  useSearchParams();
  return children;
}

function LoadingContent({ text = DIALOG_MESSAGES.LOADING_TEXT_DEFAULT }: { text?: string }) {
  return (
    <motion.div
      animate={{ opacity: 1, scale: 1 }}
      className="flex min-h-[240px] flex-col items-center justify-center gap-4"
      initial={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <LoadingSpinner className="h-12 w-12" size="lg" />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="text-base text-muted-foreground"
        initial={{ opacity: 0, y: 5 }}
        transition={{ delay: 0.1, duration: 0.2 }}
      >
        {text}
      </motion.div>
    </motion.div>
  );
}

export function PageWrapper({
  children,
  variant = 'default',
  className,
  withSearchParams = false,
  isLoading = false,
  loadingText,
}: PageWrapperProps) {
  const baseVariantClass = 'min-h-screen bg-background';
  const variants = {
    default: baseVariantClass,
    dashboard: baseVariantClass,
    root: baseVariantClass,
  };

  const content = (
    <motion.div
      animate={{ opacity: 1 }}
      className={cn(variants[variant], className)}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      transition={transitions.smooth}
    >
      {variant === 'default' && (
        <div className="-space-x-52 pointer-events-none absolute inset-0 grid grid-cols-2 opacity-20 dark:opacity-10">
          <div className="h-56 bg-linear-to-br from-primary to-purple-400 blur-[106px] dark:from-blue-700" />
          <div className="h-32 bg-linear-to-r from-cyan-400 to-sky-300 blur-[106px] dark:to-indigo-600" />
        </div>
      )}

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.05, ...transitions.smooth }}
      >
        <div
          className={cn('p-4 xs:p-5 sm:p-6', variant === 'dashboard' && 'p-3 xs:p-4 sm:p-5 md:p-6')}
        >
          {isLoading ? (
            <LoadingContent text={loadingText ?? DIALOG_MESSAGES.LOADING_TEXT_DEFAULT} />
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
