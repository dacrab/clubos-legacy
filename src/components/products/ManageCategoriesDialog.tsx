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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ListPlus, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface DeleteDialogState {
  isOpen: boolean;
  category: Category | null;
  type: 'category' | 'subcategory';
}

interface ManageCategoriesDialogProps {
  existingCategories: string[];
  existingSubcategories: string[];
}

export function ManageCategoriesDialog({
  existingCategories,
  existingSubcategories,
}: ManageCategoriesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [newSubcategory, setNewSubcategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    category: null,
    type: 'category'
  });

  // Fetch categories on mount and when dialog opens
  const fetchCategories = async () => {
    const supabase = createClient();
    
    const { data: mainCategories } = await supabase
      .from('categories')
      .select('*')
      .is('parent_id', null)
      .eq('is_deleted', false)
      .order('name');

    const { data: subCategories } = await supabase
      .from('categories')
      .select('*')
      .not('parent_id', 'is', null)
      .eq('is_deleted', false)
      .order('name');

    if (mainCategories) setCategories(mainCategories);
    if (subCategories) setSubcategories(subCategories);
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
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
          name: newCategory,
          last_edited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Success", {
        description: "Category added successfully."
      });

      setNewCategory("");
      setCategories([...categories, newCategoryData]);
    } catch (error) {
      console.error("Add category error:", error);
      toast.error("Error", {
        description: "Failed to add category. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategory.trim() || selectedCategory === "all") return;
    setIsLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Error", {
        description: "You must be logged in to add subcategories."
      });
      setIsLoading(false);
      return;
    }

    try {
      // First get the parent category ID
      const parentCategory = categories.find(c => c.name === selectedCategory);

      if (!parentCategory) {
        throw new Error("Parent category not found");
      }

      const { data: newSubcategoryData, error } = await supabase
        .from("categories")
        .insert({
          name: newSubcategory,
          parent_id: parentCategory.id,
          last_edited_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Success", {
        description: "Subcategory added successfully."
      });

      setNewSubcategory("");
      setSubcategories([...subcategories, newSubcategoryData]);
    } catch (error) {
      console.error("Add subcategory error:", error);
      toast.error("Error", {
        description: "Failed to add subcategory. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (confirmed: boolean) => {
    if (!confirmed || !deleteDialog.category) {
      setDeleteDialog({ isOpen: false, category: null, type: 'category' });
      return;
    }

    setIsLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Error", {
        description: "You must be logged in to delete categories."
      });
      setIsLoading(false);
      return;
    }

    try {
      // If deleting a category, also delete its subcategories
      if (deleteDialog.type === 'category') {
        // First, soft delete all subcategories
        await supabase
          .from("categories")
          .update({
            is_deleted: true,
            last_edited_by: user.id
          })
          .eq('parent_id', deleteDialog.category.id);

        // Then, soft delete the category
        const { error } = await supabase
          .from("categories")
          .update({
            is_deleted: true,
            last_edited_by: user.id
          })
          .eq('id', deleteDialog.category.id);

        if (error) throw error;

        setCategories(categories.filter(c => c.id !== deleteDialog.category?.id));
        setSubcategories(subcategories.filter(s => s.parent_id !== deleteDialog.category?.id));
      } else {
        // Delete just the subcategory
        const { error } = await supabase
          .from("categories")
          .update({
            is_deleted: true,
            last_edited_by: user.id
          })
          .eq('id', deleteDialog.category.id);

        if (error) throw error;

        setSubcategories(subcategories.filter(s => s.id !== deleteDialog.category?.id));
      }

      toast.success("Success", {
        description: `${deleteDialog.type === 'category' ? 'Category' : 'Subcategory'} deleted successfully.`
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error", {
        description: `Failed to delete ${deleteDialog.type}. Please try again.`
      });
    } finally {
      setIsLoading(false);
      setDeleteDialog({ isOpen: false, category: null, type: 'category' });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2"
      >
        <ListPlus className="h-4 w-4" />
        Manage Categories
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Add new categories and subcategories for your products.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Add Category */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Add New Category</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <Button
                    onClick={handleAddCategory}
                    disabled={isLoading || !newCategory.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Existing Categories:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <span
                      key={category.id}
                      className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                    >
                      {category.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1 h-4 w-4 rounded-full hover:bg-secondary-foreground/20"
                        onClick={() => setDeleteDialog({
                          isOpen: true,
                          category,
                          type: 'category'
                        })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Subcategory */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Add New Subcategory</Label>
                <div className="space-y-2">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Select Category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter subcategory name"
                      value={newSubcategory}
                      onChange={(e) => setNewSubcategory(e.target.value)}
                      disabled={selectedCategory === "all"}
                    />
                    <Button
                      onClick={handleAddSubcategory}
                      disabled={
                        isLoading ||
                        !newSubcategory.trim() ||
                        selectedCategory === "all"
                      }
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Existing Subcategories:
                </Label>
                <div className="flex flex-wrap gap-2">
                  {subcategories
                    .filter(sub => {
                      const parentCategory = categories.find(c => c.id === sub.parent_id);
                      return selectedCategory === "all" || parentCategory?.name === selectedCategory;
                    })
                    .map((subcategory) => (
                      <span
                        key={subcategory.id}
                        className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                      >
                        {subcategory.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-1 h-4 w-4 rounded-full hover:bg-secondary-foreground/20"
                          onClick={() => setDeleteDialog({
                            isOpen: true,
                            category: subcategory,
                            type: 'subcategory'
                          })}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={deleteDialog.isOpen} 
        onOpenChange={(open: boolean) => {
          if (!open) handleDelete(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteDialog.type === 'category' 
                ? "This will delete the category and all its subcategories. This action cannot be undone."
                : "This will delete the subcategory. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(true)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 