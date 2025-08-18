import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

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
        <div className="animate-fade-in flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" />
          <span className="animate-fade-in opacity-90">{loadingText}</span>
          <div className="bg-primary/10 absolute bottom-0 left-0 h-0.5 w-full">
            <div className="bg-primary/30 absolute inset-0 animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="animate-fade-in flex items-center justify-center">{children}</div>
      )}
    </Button>
  );
}
