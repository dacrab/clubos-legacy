import { cn } from '@/lib/utils';

interface StockStatusBadgeProps {
  status: {
    text: string;
    className: string;
  };
  size?: 'sm' | 'md';
}

export function StockStatusBadge({ status, size = 'md' }: StockStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full ring-1 ring-inset',
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        'font-medium',
        status.className
      )}
    >
      {status.text}
    </span>
  );
}
