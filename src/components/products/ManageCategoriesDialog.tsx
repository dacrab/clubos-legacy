'use client';

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ListPlus } from "lucide-react";

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
  const { toast } = useToast();

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setIsLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to add categories.",
      });
      setIsLoading(false);
      return;
    }

    try {
      await supabase
        .from("products")
        .insert({
          name: `${newCategory} Category`,
          category: newCategory,
          price: 0,
          stock: 0,
          created_by: user.id,
          is_deleted: true,
        })
        .throwOnError();

      toast({
        title: "Success",
        description: "Category added successfully.",
      });

      setNewCategory("");
      window.location.reload();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add category.",
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to add subcategories.",
      });
      setIsLoading(false);
      return;
    }

    try {
      await supabase
        .from("products")
        .insert({
          name: `${newSubcategory} Subcategory`,
          category: selectedCategory,
          subcategory: newSubcategory,
          price: 0,
          stock: 0,
          created_by: user.id,
          is_deleted: true,
        })
        .throwOnError();

      toast({
        title: "Success",
        description: "Subcategory added successfully.",
      });

      setNewSubcategory("");
      window.location.reload();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add subcategory.",
      });
    } finally {
      setIsLoading(false);
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
                  {existingCategories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                    >
                      {category}
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
                      {existingCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
                  {existingSubcategories.map((subcategory) => (
                    <span
                      key={subcategory}
                      className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                    >
                      {subcategory}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 