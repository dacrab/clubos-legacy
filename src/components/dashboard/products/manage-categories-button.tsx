'use client';

import { FolderTree } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils/format';

import ManageProductCategoriesDialog from './manage-categories-dialog';

// Constants
const STYLES = {
  button: {
    base: 'w-full sm:w-auto',
    icon: 'h-4 w-4',
    text: 'text-sm',
  },
} as const;

export default function ManageProductCategoriesButton() {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button className={STYLES.button.base} onClick={() => setOpen(true)} variant="outline">
            <FolderTree className={cn(STYLES.button.icon, 'mr-2')} />
            <span className={STYLES.button.text}>Κατηγορίες</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Διαχείριση κατηγοριών προϊόντων</p>
        </TooltipContent>
      </Tooltip>

      <ManageProductCategoriesDialog onOpenChange={setOpen} open={open} />
    </TooltipProvider>
  );
}
