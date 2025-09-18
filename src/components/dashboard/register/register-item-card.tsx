import { ChevronDown } from 'lucide-react';
// no React hooks needed here

import { Card, CardHeader } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/date-utils';
import { cn } from '@/lib/utils/format';
import type { ListItem } from '@/types/register';

import ClosingDetails from './closing-details';

// Type Definitions

type RegisterItemCardProps = {
  item: ListItem;
  isExpanded: boolean;
  onToggle: (id: string) => void;
};

// (Transaction summary UI removed)

// Main component with optimization
export function RegisterItemCard({ item, isExpanded, onToggle }: RegisterItemCardProps) {
  const isActive = item.type === 'active';
  const id = isActive ? item.id : item.session.id;
  const openedAt = item.session.opened_at;
  const closedAt = isActive ? null : item.session.closed_at;

  // Totals summary removed in this view

  const handleToggle = () => onToggle(id);
  const handleToggleKey: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleToggle();
    }
  };

  return (
    <Card
      className={cn(
        'w-full p-3 transition-colors sm:p-4',
        isActive && 'border-primary/20',
        isExpanded && 'bg-muted/50'
      )}
    >
      <CardHeader className="cursor-pointer" onClick={handleToggle} onKeyDown={handleToggleKey}>
        <div className="flex justify-between">
          <div>
            <h3 className="font-semibold">{formatDate(new Date(openedAt))}</h3>
            <p className="text-muted-foreground text-sm">
              {isActive ? 'Ενεργή Βάρδια' : `Έκλεισε: ${formatDate(new Date(closedAt || ''))}`}
            </p>
          </div>
          <ChevronDown
            className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </div>
      </CardHeader>
      {isExpanded && (
        <ClosingDetails closing={null} orders={item.session.orders ?? []} session={item.session} />
      )}
    </Card>
  );
}
