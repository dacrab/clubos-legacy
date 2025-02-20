'use client'

import { useState } from "react"
import { ManageCategoriesDialog } from "./ManageCategoriesDialog"
import { Button } from "@/components/ui/button"
import { Tags } from "lucide-react"

export function ManageCategoriesButton() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Tags className="h-4 w-4 mr-2" />
        Manage Categories
      </Button>
      <ManageCategoriesDialog 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => setIsOpen(false)}
      />
    </>
  )
} 