'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { AddCodeDialog } from './add-code-dialog';

export default function AddCodeButton() {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="w-full sm:w-auto"
            onClick={() => setOpen(true)}
            size="default"
            variant="default"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="font-medium text-sm">Νέος Κωδικός</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Προσθήκη νέου κωδικού</p>
        </TooltipContent>
      </Tooltip>
      <AddCodeDialog isOpen={open} onClose={() => setOpen(false)} />
    </TooltipProvider>
  );
}
