"use client";

import { useState, useMemo } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { DIALOG_MESSAGES, API_ERROR_MESSAGES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useCategories } from "@/hooks/data/useCategories";
import type { Category } from "@/types/products";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STYLES = {
  form: { container: "grid grid-cols-1 gap-4 md:gap-6" },
  dialog: {
    content: "w-[95vw] max-w-[425px] p-3 sm:p-4 md:p-6 gap-3 sm:gap-4 md:gap-6 max-h-[90vh] overflow-y-auto",
    header: "space-y-1 md:space-y-2 mb-2 md:mb-4",
  },
  category: {
    item: "flex items-center justify-between p-3 rounded-lg hover:bg-secondary/70 transition-colors",
    main: "bg-secondary/50",
    sub: "mt-1 ml-6 border-l-2 border-primary/30 bg-secondary/30",
    deleteButton: "hover:text-destructive p-1 rounded-full hover:bg-destructive/10 transition-colors"
  }
} as const;

export default function ManageCategoriesDialog({ open, onOpenChange }: ManageCategoriesDialogProps) {
  const { categories, subCategories, refetch } = useCategories();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const supabase = createClientSupabase();
  
  const mainCategories = useMemo(() => categories.filter(c => !c.parent_id), [categories]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return toast.error(API_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase.from('categories').insert([{ name: newCategoryName.trim(), parent_id: parentCategoryId, created_by: user.id }]);
      if (error) {
        if (error.message.includes('unique_category_name')) toast.error('Υπάρχει ήδη κατηγορία με αυτό το όνομα');
        else throw error;
        return;
      }
      toast.success('Η κατηγορία προστέθηκε επιτυχώς');
      setNewCategoryName("");
      setParentCategoryId(null);
      refetch();
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setLoading(true);
    try {
      await supabase.from('categories').delete().eq('id', categoryToDelete.id).throwOnError();
      toast.success('Η κατηγορία διαγράφηκε επιτυχώς');
      setCategoryToDelete(null);
      refetch();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const CategoryItem = ({ category, isSubCategory = false }: { category: Category, isSubCategory?: boolean }) => (
    <div className={cn(STYLES.category.item, isSubCategory ? STYLES.category.sub : STYLES.category.main)}>
      <div className="flex items-center gap-2">
        {isSubCategory && <span className="text-muted-foreground text-sm">↳</span>}
        <span className="text-sm font-medium">{category.name}</span>
      </div>
      <button type="button" onClick={() => setCategoryToDelete(category)} className={STYLES.category.deleteButton}>
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );

  const deleteDialogDescription = useMemo(() => {
    if (!categoryToDelete) return "";
    let desc = `Είστε σίγουροι ότι θέλετε να διαγράψετε την κατηγορία "${categoryToDelete.name}"`;
    if (!categoryToDelete.parent_id && subCategories[categoryToDelete.id]?.length > 0) {
      desc += ". Προσοχή: Η διαγραφή αυτής της κατηγορίας θα διαγράψει και όλες τις υποκατηγορίες της!";
    }
    return desc;
  }, [categoryToDelete, subCategories]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={STYLES.dialog.content}>
          <DialogHeader className={STYLES.dialog.header}>
            <DialogTitle>Διαχείριση Κατηγοριών</DialogTitle>
            <DialogDescription>Προσθέστε ή διαγράψτε κατηγορίες προϊόντων</DialogDescription>
          </DialogHeader>
          <div className={STYLES.form.container}>
            <div className="space-y-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="categoryName">Όνομα νέας κατηγορίας</Label>
                <Input id="categoryName" placeholder="Εισάγετε όνομα" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} disabled={loading} />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="parentCategory">Γονική κατηγορία</Label>
                <Select value={parentCategoryId || "none"} onValueChange={(v) => setParentCategoryId(v === "none" ? null : v)} disabled={loading}>
                  <SelectTrigger><SelectValue placeholder="Επιλέξτε γονική κατηγορία" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Καμία</SelectItem>
                    {mainCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <LoadingButton onClick={handleAddCategory} disabled={loading || !newCategoryName.trim()} loading={loading} className="w-full">{DIALOG_MESSAGES.SAVE_BUTTON}</LoadingButton>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Υπάρχουσες Κατηγορίες</h3>
              <div className="space-y-3">
                {mainCategories.map((c) => (
                  <div key={c.id}>
                    <CategoryItem category={c} />
                    {subCategories[c.id]?.map((sub) => <CategoryItem key={sub.id} category={sub} isSubCategory />)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmationDialog open={!!categoryToDelete} onOpenChange={(isOpen) => !isOpen && setCategoryToDelete(null)} title="Διαγραφή Κατηγορίας" description={deleteDialogDescription} onConfirm={handleDeleteCategory} loading={loading} />
    </>
  );
} 