"use client";

import { FolderTree } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import ManageCategoriesDialog from "./ManageCategoriesDialog";

// Constants
const STYLES = {
  button: {
    base: "w-full sm:w-auto",
    icon: "h-4 w-4",
    text: "text-sm"
  }
} as const;

export default function ManageCategoriesButton() {
  const [open, setOpen] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setOpen(true)}
            variant="outline"
            className={STYLES.button.base}
          >
            <FolderTree className={cn(STYLES.button.icon, "mr-2")} />
            <span className={STYLES.button.text}>Κατηγορίες</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Διαχείριση κατηγοριών προϊόντων</p>
        </TooltipContent>
      </Tooltip>

      <ManageCategoriesDialog
        open={open}
        onOpenChange={setOpen}
      />
    </TooltipProvider>
  );
}
