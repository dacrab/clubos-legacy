'use client';

import {
  CheckboxItem,
  Content,
  Group,
  Item,
  ItemIndicator,
  Label,
  Portal,
  RadioGroup,
  RadioItem,
  Root,
  Separator,
  Sub,
  SubContent,
  SubTrigger,
  Trigger,
} from '@radix-ui/react-dropdown-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils/format';

const DropdownMenu = Root;
const DropdownMenuTrigger = React.forwardRef<
  React.ElementRef<typeof Trigger>,
  React.ComponentPropsWithoutRef<typeof Trigger>
>(({ className, ...props }, ref) => (
  <Trigger
    className={cn('w-full cursor-pointer select-none focus:outline-hidden', className)}
    ref={ref}
    {...props}
  />
));
DropdownMenuTrigger.displayName = Trigger.displayName;

const DropdownMenuGroup = Group;
const DropdownMenuPortal = Portal;
const DropdownMenuSub = Sub;
const DropdownMenuRadioGroup = RadioGroup;

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof SubTrigger>,
  React.ComponentPropsWithoutRef<typeof SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <SubTrigger
    className={cn(
      'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden focus:bg-accent data-[state=open]:bg-accent',
      inset && 'pl-8',
      className
    )}
    ref={ref}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </SubTrigger>
));
DropdownMenuSubTrigger.displayName = SubTrigger.displayName;

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof SubContent>,
  React.ComponentPropsWithoutRef<typeof SubContent>
>(({ className, ...props }, ref) => (
  <SubContent
    className={cn(
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=closed]:animate-out data-[state=open]:animate-in',
      className
    )}
    ref={ref}
    {...props}
  />
));
DropdownMenuSubContent.displayName = SubContent.displayName;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof Content>,
  React.ComponentPropsWithoutRef<typeof Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <Portal>
    <Content
      className={cn(
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-32 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in',
        className
      )}
      ref={ref}
      sideOffset={sideOffset}
      {...props}
    />
  </Portal>
));
DropdownMenuContent.displayName = Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof Item>,
  React.ComponentPropsWithoutRef<typeof Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <Item
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
      inset && 'pl-8',
      className
    )}
    ref={ref}
    {...props}
  />
));
DropdownMenuItem.displayName = Item.displayName;

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <CheckboxItem
    checked={checked ?? false}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ItemIndicator>
        <Check className="h-4 w-4" />
      </ItemIndicator>
    </span>
    {children}
  </CheckboxItem>
));
DropdownMenuCheckboxItem.displayName = CheckboxItem.displayName;

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof RadioItem>,
  React.ComponentPropsWithoutRef<typeof RadioItem>
>(({ className, children, ...props }, ref) => (
  <RadioItem
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50',
      className
    )}
    ref={ref}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </ItemIndicator>
    </span>
    {children}
  </RadioItem>
));
DropdownMenuRadioItem.displayName = RadioItem.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <Label
    className={cn('px-2 py-1.5 font-semibold text-sm', inset && 'pl-8', className)}
    ref={ref}
    {...props}
  />
));
DropdownMenuLabel.displayName = Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentPropsWithoutRef<typeof Separator>
>(({ className, ...props }, ref) => (
  <Separator className={cn('-mx-1 my-1 h-px bg-muted', className)} ref={ref} {...props} />
));
DropdownMenuSeparator.displayName = Separator.displayName;

const DropdownMenuShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span className={cn('ml-auto text-xs tracking-widest opacity-60', className)} {...props} />
  );
};
DropdownMenuShortcut.displayName = 'DropdownMenuShortcut';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
};
