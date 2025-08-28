"use client";

import { useState, useEffect, useCallback } from "react";
import { createClientSupabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import { Database } from "@/types/supabase";
import { Trash2 } from "lucide-react";
import { DIALOG_MESSAGES, API_ERROR_MESSAGES, BUTTON_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Types
type CategoryRow = Database['public']['Tables']['categories']['Row'];

interface Category extends CategoryRow {
  subcategories?: Category[];
}

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STYLES = {
  form: {
    container: "grid grid-cols-1 gap-4 md:gap-6",
    field: {
      container: "space-y-1.5 md:space-y-2",
      input: {
        base: "w-full text-sm md:text-base",
        withIcon: "pr-10"
      }
    }
  },
  dialog: {
    content: "w-[95vw] max-w-[425px] p-3 sm:p-4 md:p-6 gap-3 sm:gap-4 md:gap-6 max-h-[90vh] overflow-y-auto",
    header: "space-y-1 md:space-y-2 mb-2 md:mb-4",
    form: "overflow-y-auto"
  },
  category: {
    item: "flex items-center justify-between p-3 rounded-lg hover:bg-secondary/70 transition-colors",
    main: "bg-secondary/50",
    sub: "mt-1 ml-6 border-l-2 border-primary/30 bg-secondary/30",
    deleteButton: "hover:text-destructive p-1 rounded-full hover:bg-destructive/10 transition-colors"
  }
} as const;

export default function ManageCategoriesDialog({ open, onOpenChange }: ManageCategoriesDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Record<string, Category[]>>({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const supabase = createClientSupabase();

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      if (!data) return;

      const mainCategories = data.filter((cat: Category) => !cat.parent_id);
      const subCategoriesMap = data.reduce((acc: Record<string, Category[]>, cat: Category) => {
        if (cat.parent_id) {
          acc[cat.parent_id] = [...(acc[cat.parent_id] || []), cat];
        }
        return acc;
      }, {});

      setCategories(mainCategories);
      setSubCategories(subCategoriesMap);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
      onOpenChange(false);
    }
  }, [supabase, onOpenChange]);

  useEffect(() => {
    if (open) fetchCategories();
  }, [open, fetchCategories]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error(API_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
      return;
    }

    if (parentCategoryId && parentCategoryId !== 'none') {
      const parentCategory = categories.find(cat => cat.id === parentCategoryId);
      if (!parentCategory) {
        toast.error('Η γονική κατηγορία δεν βρέθηκε');
        return;
      }
    }

    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (!user) {
        toast.error('Δεν βρέθηκε συνδεδεμένος χρήστης');
        return;
      }

      const { data: existingCategory, error: checkError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', newCategoryName.trim())
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingCategory) {
        toast.error('Υπάρχει ήδη κατηγορία με αυτό το όνομα');
        return;
      }

      const { data: newCategory, error: insertError } = await supabase
        .from('categories')
        .insert([{
          name: newCategoryName.trim(),
          parent_id: parentCategoryId === 'none' ? null : parentCategoryId,
          created_by: user.id,
          description: null
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      if (!newCategory) {
        throw new Error('Δεν ήταν δυνατή η δημιουργία της κατηγορίας');
      }

      toast.success('Η κατηγορία προστέθηκε επιτυχώς');
      setNewCategoryName("");
      setParentCategoryId(null);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('unique_category_name')) {
          toast.error('Υπάρχει ήδη κατηγορία με αυτό το όνομα');
        } else if (error.message.includes('valid_parent')) {
          toast.error('Μη έγκυρη γονική κατηγορία');
        } else if (error.message.includes('foreign key')) {
          toast.error('Η γονική κατηγορία δεν υπάρχει');
        } else {
          toast.error(`Σφάλμα: ${error.message}`);
        }
      } else {
        toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete.id);

      if (error) throw error;

      toast.success('Η κατηγορία διαγράφηκε επιτυχώς');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const CategoryItem = ({ category, isSubCategory = false }: { category: Category, isSubCategory?: boolean }) => (
    <div className={cn(
      STYLES.category.item,
      isSubCategory ? STYLES.category.sub : STYLES.category.main
    )}>
      <div className="flex items-center gap-2">
        {isSubCategory && <span className="text-muted-foreground text-sm">↳</span>}
        <span className="text-sm font-medium">{category.name}</span>
      </div>
      <button
        type="button"
        onClick={() => {
          setCategoryToDelete(category);
          setDeleteDialogOpen(true);
        }}
        className={STYLES.category.deleteButton}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={STYLES.dialog.content}>
          <DialogHeader className={STYLES.dialog.header}>
            <DialogTitle>Διαχείριση Κατηγοριών</DialogTitle>
            <DialogDescription>
              Προσθέστε, επεξεργαστείτε ή διαγράψτε κατηγορίες προϊόντων
            </DialogDescription>
          </DialogHeader>
          
          <div className={STYLES.form.container}>
            <div className="space-y-4">
              <div className={STYLES.form.field.container}>
                <Label htmlFor="categoryName">Όνομα νέας κατηγορίας</Label>
                <Input
                  id="categoryName"
                  placeholder="Εισάγετε το όνομα της κατηγορίας"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className={STYLES.form.field.input.base}
                  disabled={loading}
                />
              </div>
              
              <div className={STYLES.form.field.container}>
                <Label htmlFor="parentCategory">Γονική κατηγορία</Label>
                <Select
                  value={parentCategoryId || "none"}
                  onValueChange={(value) => setParentCategoryId(value === "none" ? null : value)}
                  disabled={loading}
                >
                  <SelectTrigger id="parentCategory" className="w-full">
                    <SelectValue placeholder="Επιλέξτε γονική κατηγορία (προαιρετικό)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Καμία γονική κατηγορία</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <LoadingButton 
                onClick={handleAddCategory} 
                disabled={loading || !newCategoryName.trim()}
                loading={loading}
                loadingText={DIALOG_MESSAGES.LOADING_TEXT_DEFAULT}
                className="w-full"
              >
                {DIALOG_MESSAGES.SAVE_BUTTON}
              </LoadingButton>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-lg">Υπάρχουσες Κατηγορίες</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id}>
                    <CategoryItem category={category} />
                    {subCategories[category.id]?.map((subCategory) => (
                      <CategoryItem 
                        key={subCategory.id} 
                        category={subCategory} 
                        isSubCategory 
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className={STYLES.dialog.content}>
          <DialogHeader className={STYLES.dialog.header}>
            <DialogTitle>Διαγραφή Κατηγορίας</DialogTitle>
            <DialogDescription>
              Είστε σίγουροι ότι θέλετε να διαγράψετε την κατηγορία &quot;{categoryToDelete?.name}&quot;;
              {categoryToDelete && !categoryToDelete.parent_id && subCategories[categoryToDelete.id]?.length > 0 && (
                <span className="block mt-2 text-destructive">
                  Προσοχή: Η διαγραφή αυτής της κατηγορίας θα διαγράψει και όλες τις υποκατηγορίες της!
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setCategoryToDelete(null);
              }}
              disabled={loading}
            >
              {BUTTON_LABELS.CANCEL}
            </Button>
            <LoadingButton
              variant="destructive"
              onClick={handleDeleteCategory}
              loading={loading}
              loadingText={DIALOG_MESSAGES.LOADING_TEXT_DEFAULT}
            >
              {BUTTON_LABELS.DELETE}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
