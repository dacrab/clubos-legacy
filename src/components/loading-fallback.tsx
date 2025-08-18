import { cn } from '@/lib/utils';

export function LoadingFallback({
  variant = 'default',
}: {
  variant?: 'default' | 'card' | 'table';
}) {
  if (variant === 'card') {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'bg-muted/50 animate-slide-in-from-bottom h-[200px] w-full rounded-lg',
              `animation-delay-[${i * 100}ms]`
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="bg-muted/50 h-4 w-32 animate-pulse rounded" />
          <div className="bg-muted/50 animation-delay-200 h-4 w-24 animate-pulse rounded" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'bg-muted/50 animate-slide-in-from-bottom h-4 w-full rounded',
                `animation-delay-[${i * 100}ms]`
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center space-y-4">
      <div className="bg-muted/50 h-4 w-48 animate-pulse rounded" />
      <div className="bg-muted/50 animation-delay-200 h-4 w-32 animate-pulse rounded" />
    </div>
  );
}
