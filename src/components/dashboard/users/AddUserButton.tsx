"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import AddUserDialog from "./AddUserDialog";

export default function AddUserButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Νέος Χρήστης
      </Button>
      <AddUserDialog open={open} onOpenChange={setOpen} />
    </>
  );
} 