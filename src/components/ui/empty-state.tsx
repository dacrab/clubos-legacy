import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="rounded-lg border p-4 md:p-12">
      <div className="flex flex-col items-center justify-center space-y-3 text-center">
        <div className="bg-muted/50 rounded-full p-3">
          <Icon className="text-muted-foreground h-6 w-6 md:h-8 md:w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-medium md:text-xl">{title}</h3>
          <p className="text-muted-foreground text-sm md:text-base">{description}</p>
        </div>
      </div>
    </div>
  );
}
