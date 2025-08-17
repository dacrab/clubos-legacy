import { Button, type ButtonProps } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  loading = false,
  loadingText = "Φόρτωση...",
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      className={cn("relative overflow-hidden", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 animate-fade-in">
          <LoadingSpinner size="sm" />
          <span className="animate-fade-in opacity-90">
            {loadingText}
          </span>
          <div className="absolute bottom-0 left-0 h-0.5 bg-primary/10 w-full">
            <div className="absolute inset-0 bg-primary/30 animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center animate-fade-in">
          {children}
        </div>
      )}
    </Button>
  );
} 