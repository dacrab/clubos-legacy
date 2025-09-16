import { motion } from 'framer-motion';

import { Button, type ButtonProps } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils/format';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  loading = false,
  loadingText = 'Φόρτωση...',
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      className={cn('relative overflow-hidden', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <LoadingSpinner size="sm" />
          <motion.span
            animate={{ opacity: 0.9 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {loadingText}
          </motion.span>
          <motion.div
            animate={{ width: '100%' }}
            className="absolute bottom-0 left-0 h-0.5 w-full bg-primary/10"
            initial={{ width: 0 }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          >
            <motion.div
              animate={{ x: '100%' }}
              className="absolute inset-0 bg-primary/30"
              initial={{ x: '-100%' }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'linear',
              }}
            />
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </Button>
  );
}
