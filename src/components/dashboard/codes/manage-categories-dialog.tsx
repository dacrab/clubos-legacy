'use client';

import { Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { API_ERROR_MESSAGES, BUTTON_LABELS, DIALOG_MESSAGES } from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase';
import { cn } from '@/lib/utils/format';
import type { Database } from '@/types/supabase';

// Types
type CategoryRow = Database['public']['Tables']['categories']['Row'];

type Category = CategoryRow & {
  subcategories?: Category[];
};

type ManageCategoriesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const STYLES = {
  form: {
    container: 'grid grid-cols-1 gap-4 md:gap-6',
    field: {
      container: 'space-y-1.5 md:space-y-2',
      input: {
        base: 'w-full text-sm md:text-base',
        withIcon: 'pr-10',
      },
    },
  },
  dialog: {
    content:
      'w-[95vw] max-w-[425px] p-3 sm:p-4 md:p-6 gap-3 sm:gap-4 md:gap-6 max-h-[90vh] overflow-y-auto',
    header: 'space-y-1 md:space-y-2 mb-2 md:mb-4',
    form: 'overflow-y-auto',
  },
  category: {
    item: 'flex items-center justify-between p-3 rounded-lg hover:bg-secondary/70 transition-colors',
    main: 'bg-secondary/50',
    sub: 'mt-1 ml-6 border-l-2 border-primary/30 bg-secondary/30',
    deleteButton:
      'hover:text-destructive p-1 rounded-full hover:bg-destructive/10 transition-colors',
  },
} as const;

function CategoryItem({
  category,
  isSubCategory = false,
  onDelete,
}: {
  category: Category;
  isSubCategory?: boolean;
  onDelete: (category: Category) => void;
}) {
  return (
    <div
      className={cn(
        STYLES.category.item,
        isSubCategory ? STYLES.category.sub : STYLES.category.main
      )}
    >
      <div className="flex items-center gap-2">
        {isSubCategory && <span className="text-muted-foreground text-sm">↳</span>}
        <span className="font-medium text-sm">{category.name}</span>
      </div>
      <button
        className={STYLES.category.deleteButton}
        onClick={() => onDelete(category)}
        type="button"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ManageCategoriesDialog({
  open,
  onOpenChange,
}: ManageCategoriesDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Partial<Record<string, Category[]>>>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const supabase = createClientSupabase();

  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');

      if (error) {
        throw error;
      }
      if (!data) {
        return;
      }

      const mainCategories = data.filter((cat: Category) => !cat.parent_id);
      const subCategoriesMap = data.reduce(
        (acc: Partial<Record<string, Category[]>>, cat: Category) => {
          if (cat.parent_id) {
            acc[cat.parent_id] = [...(acc[cat.parent_id] ?? []), cat];
          }
          return acc;
        },
        {} as Partial<Record<string, Category[]>>
      );

      setCategories(mainCategories);
      setSubCategories(subCategoriesMap);
    } catch (_error) {
      toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
      onOpenChange(false);
    }
  }, [supabase, onOpenChange]);

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open, fetchCategories]);

  const validateCategory = (name: string, parentId: string | null): boolean => {
    if (!name.trim()) {
      toast.error(API_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS);
      return false;
    }
    if (parentId && parentId !== 'none' && !categories.find((cat) => cat.id === parentId)) {
      toast.error('Η γονική κατηγορία δεν βρέθηκε');
      return false;
    }
    return true;
  };

  const checkExistingCategory = async (name: string) => {
    const { data: existingCategory, error } = await supabase
      .from('categories')
      .select('id')
      .eq('name', name.trim())
      .maybeSingle();
    if (error) {
      throw error;
    }
    if (existingCategory) {
      toast.error('Υπάρχει ήδη κατηγορία με αυτό το όνομα');
      return true;
    }
    return false;
  };

  const insertCategory = async (name: string, parentId: string | null, userId: string) => {
    const { error } = await supabase.from('categories').insert([
      {
        name: name.trim(),
        parent_id: parentId === 'none' ? null : parentId,
        created_by: userId,
        description: null,
      },
    ]);
    if (error) {
      throw error;
    }
  };

  const handleAddCategory = async () => {
    if (!validateCategory(newCategoryName, parentCategoryId)) {
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Δεν βρέθηκε συνδεδεμένος χρήστης');
        return;
      }
      if (await checkExistingCategory(newCategoryName)) {
        return;
      }

      await insertCategory(newCategoryName, parentCategoryId, user.id);

      toast.success('Η κατηγορία προστέθηκε επιτυχώς');
      setNewCategoryName('');
      setParentCategoryId(null);
      fetchCategories();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Σφάλμα: ${error.message}`);
      } else {
        toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('categories').delete().eq('id', categoryToDelete.id);

      if (error) {
        throw error;
      }

      toast.success('Η κατηγορία διαγράφηκε επιτυχώς');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (_error) {
      toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog onOpenChange={onOpenChange} open={open}>
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
                  className={STYLES.form.field.input.base}
                  disabled={loading}
                  id="categoryName"
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Εισάγετε το όνομα της κατηγορίας"
                  value={newCategoryName}
                />
              </div>

              <div className={STYLES.form.field.container}>
                <Label htmlFor="parentCategory">Γονική κατηγορία</Label>
                <Select
                  disabled={loading}
                  onValueChange={(value) => setParentCategoryId(value === 'none' ? null : value)}
                  value={parentCategoryId || 'none'}
                >
                  <SelectTrigger className="w-full" id="parentCategory">
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
                className="w-full"
                disabled={loading || !newCategoryName.trim()}
                loading={loading}
                loadingText={DIALOG_MESSAGES.LOADING_TEXT_DEFAULT}
                onClick={handleAddCategory}
              >
                {DIALOG_MESSAGES.SAVE_BUTTON}
              </LoadingButton>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-lg">Υπάρχουσες Κατηγορίες</h3>
              <div className="space-y-3">
                {categories.map((category) => {
                  const subcats = subCategories[category.id];
                  return (
                    <div key={category.id}>
                      <CategoryItem
                        category={category}
                        onDelete={(cat) => {
                          setCategoryToDelete(cat);
                          setDeleteDialogOpen(true);
                        }}
                      />
                      {subcats?.map((subCategory) => (
                        <CategoryItem
                          category={subCategory}
                          isSubCategory
                          key={subCategory.id}
                          onDelete={(cat) => {
                            setCategoryToDelete(cat);
                            setDeleteDialogOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
        <DialogContent className={STYLES.dialog.content}>
          <DialogHeader className={STYLES.dialog.header}>
            <DialogTitle>Διαγραφή Κατηγορίας</DialogTitle>
            <DialogDescription>
              Είστε σίγουροι ότι θέλετε να διαγράψετε την κατηγορία &quot;
              {categoryToDelete?.name}&quot;;
              {(() => {
                if (categoryToDelete && !categoryToDelete.parent_id) {
                  const subcats = subCategories[categoryToDelete.id];
                  if (subcats && subcats.length > 0) {
                    return (
                      <span className="mt-2 block text-destructive">
                        Προσοχή: Η διαγραφή αυτής της κατηγορίας θα διαγράψει και όλες τις
                        υποκατηγορίες της!
                      </span>
                    );
                  }
                }
                return null;
              })()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              disabled={loading}
              onClick={() => {
                setDeleteDialogOpen(false);
                setCategoryToDelete(null);
              }}
              variant="outline"
            >
              {BUTTON_LABELS.CANCEL}
            </Button>
            <LoadingButton
              loading={loading}
              loadingText={DIALOG_MESSAGES.LOADING_TEXT_DEFAULT}
              onClick={handleDeleteCategory}
              variant="destructive"
            >
              {BUTTON_LABELS.DELETE}
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
