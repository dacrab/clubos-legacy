"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddCodeDialog } from "./AddCodeDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function AddCodeButton() {
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
            <span className="text-sm font-medium">Νέος Κωδικός</span>
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