import { Button } from './button';

type MobileSortButtonProps = {
  active: boolean;
  label: string;
  onClick: () => void;
  sortOrder?: 'asc' | 'desc';
};

export function MobileSortButton({ active, label, onClick, sortOrder }: MobileSortButtonProps) {
  return (
    <Button
      className="whitespace-nowrap"
      onClick={onClick}
      size="sm"
      variant={active ? 'default' : 'ghost'}
    >
      {label} {active && (sortOrder === 'asc' ? '↑' : '↓')}
    </Button>
  );
}
