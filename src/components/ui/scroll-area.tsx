import {
  Corner,
  Root,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  Viewport,
} from '@radix-ui/react-scroll-area';
import React from 'react';

import { cn } from '@/lib/utils/format';

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root>
>(({ className, children, ...props }, ref) => (
  <Root className={cn('relative overflow-hidden', className)} ref={ref} {...props}>
    <Viewport className="h-full w-full rounded-[inherit]">{children}</Viewport>
    <ScrollBar />
    <Corner />
  </Root>
));
ScrollArea.displayName = Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaScrollbar>
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaScrollbar
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-px',
      orientation === 'horizontal' && 'h-2.5 border-t border-t-transparent p-px',
      className
    )}
    orientation={orientation}
    ref={ref}
    {...props}
  >
    <ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
