import { ArrowUpDown } from 'lucide-react';

import { cn } from '@/lib/utils/format';

import { Button } from './button';

type SortButtonProps = {
  active: boolean;
  label: string;
  onClick: () => void;
  className?: string;
};

export function SortButton({ active, label, onClick, className }: SortButtonProps) {
  return (
    <Button
      className={cn(
        'flex w-full items-center gap-2 py-4 font-medium text-lg',
        'hover:text-primary dark:hover:text-primary',
        'transition-colors duration-200',
        'hover:bg-transparent',
        active && 'text-primary dark:text-primary',
        className
      )}
      onClick={onClick}
      variant="ghost"
    >
      <span>{label}</span>
      <ArrowUpDown
        className={cn(
          'h-5 w-5 transition-colors duration-200',
          active ? 'text-primary dark:text-primary' : 'text-muted-foreground',
          'group-hover:text-primary dark:group-hover:text-primary'
        )}
      />
    </Button>
  );
}
