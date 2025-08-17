import { cn } from "@/lib/utils";

export function LoadingFallback({ variant = "default" }: { variant?: "default" | "card" | "table" }) {
  if (variant === "card") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-[200px] w-full rounded-lg bg-muted/50 animate-slide-in-from-bottom",
              `animation-delay-[${i * 100}ms]`
            )}
          />
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-32 rounded bg-muted/50 animate-pulse" />
          <div className="h-4 w-24 rounded bg-muted/50 animate-pulse animation-delay-200" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-4 w-full rounded bg-muted/50 animate-slide-in-from-bottom",
                `animation-delay-[${i * 100}ms]`
              )}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <div className="h-4 w-48 rounded bg-muted/50 animate-pulse" />
      <div className="h-4 w-32 rounded bg-muted/50 animate-pulse animation-delay-200" />
    </div>
  );
} 