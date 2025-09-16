'use client';

import { Root } from '@radix-ui/react-label';
import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';

import { cn } from '@/lib/utils/format';

const labelVariants = cva(
  'font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

const Label = React.forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <Root className={cn(labelVariants(), className)} ref={ref} {...props} />
));
Label.displayName = Root.displayName;

export { Label };
