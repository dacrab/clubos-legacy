'use client'

import { useState } from "react"
import { NewProductSheet } from "./NewProductSheet"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function NewProductButton() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New Product
      </Button>
      <NewProductSheet 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={() => setIsOpen(false)}
      />
    </>
  )
} 