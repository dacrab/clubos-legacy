"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import NewSaleInterface from "./NewSaleInterface";


interface AddSaleButtonProps {
  className?: string;
}

export default function AddSaleButton({ className }: AddSaleButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className={cn("w-full", className)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Νέα Πώληση
      </Button>
      <NewSaleInterface open={open} onOpenChange={setOpen} />
    </>
  );
} 