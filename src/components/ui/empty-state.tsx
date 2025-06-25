import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="border rounded-lg p-4 md:p-12">
      <div className="flex flex-col items-center justify-center text-center space-y-3">
        <div className="bg-muted/50 p-3 rounded-full">
          <Icon className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-lg md:text-xl">{title}</h3>
          <p className="text-sm md:text-base text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
} 