import { ArrowUpDown } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './button';

interface SortButtonProps {
  active: boolean;
  label: string;
  onClick: () => void;
  className?: string;
}

export function SortButton({ active, label, onClick, className }: SortButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 py-4 text-lg font-medium',
        'hover:text-primary dark:hover:text-primary',
        'transition-colors duration-200',
        'hover:bg-transparent',
        active && 'text-primary dark:text-primary',
        className
      )}
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
