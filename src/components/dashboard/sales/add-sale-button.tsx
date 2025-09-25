'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/format';

import NewSaleInterface from './new-sale-interface';

type AddSaleButtonProps = {
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: React.ReactNode;
};

export default function AddSaleButton({
  className,
  variant = 'default',
  size = 'default',
  children = 'Νέα Πώληση',
}: AddSaleButtonProps) {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  return (
    <>
      <Button
        className={cn('w-full', className)}
        onClick={handleClick}
        size={size}
        type="button"
        variant={variant}
      >
        <Plus className="mr-2 h-4 w-4" />
        {children}
      </Button>
      <NewSaleInterface onOpenChange={setOpen} open={open} />
    </>
  );
}
