import { Coffee } from "lucide-react";

import { cn } from "@/lib/utils";

export function LoadingAnimation({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in",
        className
      )}
    >
      <div className="relative flex flex-col items-center gap-2">
        <div className="animate-spin">
          <Coffee className="h-8 w-8 text-primary" />
        </div>
        <div className="h-1 bg-primary/20 rounded-full overflow-hidden w-24">
          <div className="h-full bg-primary animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
} 