'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { AddProductDialog } from './add-product-dialog';

export default function AddProductButton() {
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
            <span className="font-medium text-sm">Νέο Προϊόν</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Προσθήκη νέου προϊόντος</p>
        </TooltipContent>
      </Tooltip>
      <AddProductDialog isOpen={open} onClose={() => setOpen(false)} />
    </TooltipProvider>
  );
}
