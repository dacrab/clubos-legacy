'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import ProductFormDialog from './ProductFormDialog';

export default function AddProductButton() {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            className="w-full sm:w-auto"
            variant="default"
            size="default"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span className="text-sm font-medium">Νέο Προϊόν</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Προσθήκη νέου προϊόντος</p>
        </TooltipContent>
      </Tooltip>
      <ProductFormDialog open={open} onOpenChange={setOpen} />
    </TooltipProvider>
  );
}
