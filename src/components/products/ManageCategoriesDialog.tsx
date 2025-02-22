'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from '@/components/ui/scroll-area'
import { Category, ManageCategoriesDialogProps } from "@/types/app";

export function ManageCategoriesDialog({
  isOpen,
  onClose,
  onSuccess,
}: ManageCategoriesDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories on mount and when dialog opens
  const fetchCategories = async () => {
    const supabase = createClient();
    
    const { data: mainCategories } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .eq('is_deleted', false)
      .order('name');

    if (mainCategories) setCategories(mainCategories);
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Error", {
        description: "You must be logged in to add categories."
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data: newCategoryData, error } = await supabase
        .from("categories")
        .insert({
          name: newCategory.trim(),
          last_edited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Category added successfully");
      setNewCategory("");
      setCategories([...categories, newCategoryData]);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Add or remove product categories
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">New Category</Label>
            <Input
              id="category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Category'}
          </Button>
        </form>
        <ScrollArea className="h-[200px] mt-4">
          <div className="space-y-2">
            {categories.map(category => (
              <div key={category.id} className="flex items-center justify-between p-2 rounded-lg border">
                <span>{category.name}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 