import { Coffee } from 'lucide-react';

import { cn } from '@/lib/utils';

export function LoadingAnimation({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-background/80 animate-fade-in fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm',
        className
      )}
    >
      <div className="relative flex flex-col items-center gap-2">
        <div className="animate-spin">
          <Coffee className="text-primary h-8 w-8" />
        </div>
        <div className="bg-primary/20 h-1 w-24 overflow-hidden rounded-full">
          <div className="bg-primary h-full animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}
