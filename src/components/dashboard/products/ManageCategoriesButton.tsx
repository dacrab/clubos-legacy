'use client';

import { useState } from 'react';
import { FolderTree } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import ManageCategoriesDialog from './ManageCategoriesDialog';

const STYLES = {
  button: { base: 'w-full sm:w-auto', icon: 'h-4 w-4', text: 'text-sm' },
} as const;

export default function ManageCategoriesButton() {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button onClick={() => setOpen(true)} variant="outline" className={STYLES.button.base}>
            <FolderTree className={cn(STYLES.button.icon, 'mr-2')} />
            <span className={STYLES.button.text}>Κατηγορίες</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Διαχείριση κατηγοριών προϊόντων</p>
        </TooltipContent>
      </Tooltip>
      <ManageCategoriesDialog open={open} onOpenChange={setOpen} />
    </TooltipProvider>
  );
}
