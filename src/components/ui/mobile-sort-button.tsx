import { Button } from "./button";

interface MobileSortButtonProps {
  active: boolean;
  label: string;
  onClick: () => void;
  sortOrder?: 'asc' | 'desc';
}

export function MobileSortButton({ active, label, onClick, sortOrder }: MobileSortButtonProps) {
  return (
    <Button
      variant={active ? 'default' : 'ghost'}
      size="sm"
      onClick={onClick}
      className="whitespace-nowrap"
    >
      {label} {active && (sortOrder === 'asc' ? '↑' : '↓')}
    </Button>
  );
} 