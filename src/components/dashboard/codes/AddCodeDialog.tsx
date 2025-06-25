"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  UNLIMITED_STOCK,
  BUTTON_LABELS,
  API_ERROR_MESSAGES
} from "@/lib/constants";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Types
interface Category {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
  created_by: string;
  parent: {
    id: string;
    name: string;
    description: string | null;
    parent_id: string | null;
    created_at: string;
    created_by: string;
  } | null;
}

interface GroupedCategory {
  main: Category;
  subcategories: Category[];
}

interface FormData {
  name: string;
  price: string;
  stock: string;
  categoryId: string;
  isUnlimited: boolean;
  imageUrl: string | null;
  uploadedImage: File | null;
  categories: string[]; // Added for multiple category selection
}

interface AddCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// Constants
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
  image: {
    container: "relative flex items-center justify-center w-full h-28 sm:h-32 md:h-40 border-2 border-dashed rounded-lg transition-all",
    preview: "absolute inset-0 w-full h-full object-contain p-2",
    placeholder: "flex flex-col items-center justify-center gap-1.5 md:gap-2 text-muted-foreground",
    remove: "absolute top-1 right-1 md:top-2 md:right-2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors"
  },
  select: {
    container: "w-full text-sm md:text-base",
    group: {
      label: "px-2 py-1.5 text-xs md:text-sm font-semibold text-muted-foreground",
      item: "pl-4 md:pl-6 text-sm md:text-base"
    }
  },
  dialog: {
    content: "w-[95vw] max-w-[425px] p-3 sm:p-4 md:p-6 gap-3 sm:gap-4 md:gap-6 max-h-[90vh] overflow-y-auto",
    header: "space-y-1 md:space-y-2 mb-2 md:mb-4",
    form: "overflow-y-auto"
  }
} as const;

export function AddCodeDialog({ isOpen, onClose }: AddCodeDialogProps) {
  const getInitialFormState = useCallback((): FormData => ({
    name: "",
    price: "",
    stock: "",
    categoryId: "",
    isUnlimited: false,
    imageUrl: null,
    uploadedImage: null,
    categories: []
  }), []);

  const [formData, setFormData] = useState<FormData>(getInitialFormState());
  const [categories, setCategories] = useState<Category[]>([]);
  const [groupedCategories, setGroupedCategories] = useState<GroupedCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const router = useRouter();
  const supabase = createClientSupabase();

  useEffect(() => {
    if (!isOpen) {
      setFormData(getInitialFormState());
    }
  }, [isOpen, getInitialFormState]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select(`
            id, name, description, created_at, parent_id,
            parent:parent_id (id, name, description, created_at, parent_id)
          `)
          .order('name');

        if (error) throw error;
        if (!data) throw new Error('Δεν ελήφθησαν δεδομένα');

        const categoriesData = data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          parent_id: cat.parent_id,
          created_at: cat.created_at,
          created_by: cat.created_by,
          parent: cat.parent && !Array.isArray(cat.parent) ? {
            id: cat.parent.id,
            name: cat.parent.name,
            description: cat.parent.description,
            parent_id: cat.parent.parent_id,
            created_at: cat.parent.created_at,
            created_by: cat.parent.created_by
          } : null
        })) as Category[];

        const mainCategories = categoriesData.filter(cat => !cat.parent_id);
        const grouped: GroupedCategory[] = mainCategories.map(main => ({
          main,
          subcategories: categoriesData.filter(cat => cat.parent_id === main.id)
        }));

        setCategories(categoriesData);
        setGroupedCategories(grouped);
      } catch (error) {
        console.error('Σφάλμα φόρτωσης κατηγοριών:', error);
        toast.error('Σφάλμα φόρτωσης κατηγοριών');
        onClose();
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [isOpen, onClose, supabase]);

  const handleImageUpload = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('Παρακαλώ επιλέξτε μια έγκυρη εικόνα');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Η εικόνα πρέπει να είναι μικρότερη από 5MB');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Παρακαλώ επιλέξτε μια έγκυρη εικόνα');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Η εικόνα πρέπει να είναι μικρότερη από 5MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      uploadedImage: file,
      imageUrl: URL.createObjectURL(file)
    }));
    toast.success('Η εικόνα προστέθηκε επιτυχώς');
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => {
      const updatedCategories = prev.categories.includes(value)
        ? prev.categories.filter(id => id !== value)
        : [...prev.categories, value];
      
      return {
        ...prev,
        categories: updatedCategories,
        categoryId: updatedCategories.length > 0 ? updatedCategories[0] : ""
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { name, price, stock, categories, isUnlimited, uploadedImage } = formData;

      if (!name.trim()) throw new Error('Το όνομα είναι υποχρεωτικό');

      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue < 0) throw new Error('Η τιμή πρέπει να είναι θετικός αριθμός');

      let stockValue = isUnlimited ? UNLIMITED_STOCK : parseInt(stock);
      if (!isUnlimited && (isNaN(stockValue) || stockValue < 0)) {
        throw new Error('Το απόθεμα πρέπει να είναι θετικός αριθμός');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Σφάλμα ταυτοποίησης');

      const imageUrl = uploadedImage ? await handleImageUpload(uploadedImage) : null;

      // Get primary category (first selected) or null
      const primaryCategoryId = categories.length > 0 ? categories[0] : null;

      const { error: insertError } = await supabase
        .from('codes')
        .insert([{
          name: name.trim(),
          price: priceValue,
          stock: stockValue,
          category_id: primaryCategoryId,
          image_url: imageUrl,
          created_by: user.id,
          categories: categories // Store all selected categories
        }]);

      if (insertError) throw insertError;

      toast.success('Code added successfully');
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : API_ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryOptions = (categories: GroupedCategory[]) => {
    return categories.map(({ main, subcategories }) => (
      <SelectGroup key={main.id}>
        <SelectLabel className="font-semibold">{main.name}</SelectLabel>
        <SelectItem value={main.id} className="pl-6">
          {main.name}
        </SelectItem>
        {subcategories.map(sub => (
          <SelectItem key={sub.id} value={sub.id} className="pl-8">
            {sub.name}
          </SelectItem>
        ))}
      </SelectGroup>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={STYLES.dialog.content}>
        <DialogHeader className={STYLES.dialog.header}>
          <DialogTitle>Προσθήκη Νέου Προϊόντος</DialogTitle>
          <DialogDescription>
            Συμπληρώστε τις λεπτομέρειες του προϊόντος παρακάτω
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={STYLES.form.container}>
          {/* Product Name */}
          <div className={STYLES.form.field.container}>
            <Label htmlFor="name">Όνομα Προϊόντος</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={STYLES.form.field.input.base}
              placeholder="Εισάγετε όνομα προϊόντος"
              required
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className={STYLES.form.field.container}>
              <Label htmlFor="price">Τιμή (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className={STYLES.form.field.input.base}
                placeholder="0.00"
                required
              />
            </div>

            <div className={STYLES.form.field.container}>
              <Label htmlFor="stock">Απόθεμα</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  className={STYLES.form.field.input.base}
                  placeholder="Ποσότητα"
                  disabled={formData.isUnlimited}
                  required={!formData.isUnlimited}
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="unlimited"
                    checked={formData.isUnlimited}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ 
                        ...prev, 
                        isUnlimited: checked as boolean,
                        stock: checked ? "" : prev.stock 
                      }))
                    }
                  />
                  <Label htmlFor="unlimited">Απεριόριστο</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Category Selection */}
          <div className={STYLES.form.field.container}>
            <Label>Κατηγορίες</Label>
            <Select
              value={formData.categories[0] || ""}
              onValueChange={(value) => handleCategoryChange(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Επιλέξτε κατηγορία" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCategories ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                ) : (
                  renderCategoryOptions(groupedCategories)
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Categories Display */}
          {formData.categories.length > 0 && (
            <div className="space-y-2">
              <Label>Επιλεγμένες Κατηγορίες</Label>
              <div className="flex flex-wrap gap-2">
                {formData.categories.map(categoryId => {
                  const category = categories.find(cat => cat.id === categoryId);
                  return (
                    <div
                      key={categoryId}
                      className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm"
                    >
                      <span>{category?.name}</span>
                      <button
                        type="button"
                        onClick={() => handleCategoryChange(categoryId)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div className={STYLES.form.field.container}>
            <Label>Εικόνα Προϊόντος</Label>
            <div
              className={cn(
                STYLES.image.container,
                formData.imageUrl ? "border-primary" : "border-border hover:border-primary"
              )}
            >
              {formData.imageUrl ? (
                <>
                  <Image
                    src={formData.imageUrl}
                    alt="Preview"
                    width={200}
                    height={200}
                    className={STYLES.image.preview}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imageUrl: null, uploadedImage: null }))}
                    className={STYLES.image.remove}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <label htmlFor="image" className={STYLES.image.placeholder}>
                  <ImagePlus className="h-8 w-8 opacity-50" />
                  <span className="text-sm">Κάντε κλικ για μεταφόρτωση εικόνας</span>
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-2">
            <LoadingButton
              type="submit"
              loading={loading}
              disabled={isLoadingCategories}
            >
              ΑΠΟΘΗΚΕΥΣΗ
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}