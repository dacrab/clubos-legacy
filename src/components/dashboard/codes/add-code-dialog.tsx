'use client';

import { ImagePlus, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { API_ERROR_MESSAGES, UNLIMITED_STOCK } from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase';
import { cn } from '@/lib/utils/format';

// Types
type Category = {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  created_at: string;
};

type GroupedCategory = {
  main: Category;
  subcategories: Category[];
};

type FormData = {
  name: string;
  price: string;
  stock: string;
  categoryId: string;
  isUnlimited: boolean;
  imageUrl: string | null;
  uploadedImage: File | null;
  categories: string[]; // Added for multiple category selection
};

type AddCodeDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Constants
const MAX_IMAGE_SIZE_MB = 5;
const BYTES_IN_KB = 1024;
const KB_IN_MB = 1024;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * KB_IN_MB * BYTES_IN_KB;

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
  image: {
    container:
      'relative flex items-center justify-center w-full h-28 sm:h-32 md:h-40 border-2 border-dashed rounded-lg transition-all',
    preview: 'absolute inset-0 w-full h-full object-contain p-2',
    placeholder: 'flex flex-col items-center justify-center gap-1.5 md:gap-2 text-muted-foreground',
    remove:
      'absolute top-1 right-1 md:top-2 md:right-2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors',
  },
  select: {
    container: 'w-full text-sm md:text-base',
    group: {
      label: 'px-2 py-1.5 text-xs md:text-sm font-semibold text-muted-foreground',
      item: 'pl-4 md:pl-6 text-sm md:text-base',
    },
  },
  dialog: {
    content:
      'w-[95vw] max-w-[425px] p-3 sm:p-4 md:p-6 gap-3 sm:gap-4 md:gap-6 max-h-[90vh] overflow-y-auto',
    header: 'space-y-1 md:space-y-2 mb-2 md:mb-4',
    form: 'overflow-y-auto',
  },
} as const;

export function AddCodeDialog({ isOpen, onClose }: AddCodeDialogProps) {
  const getInitialFormState = useCallback(
    (): FormData => ({
      name: '',
      price: '',
      stock: '',
      categoryId: '',
      isUnlimited: false,
      imageUrl: null,
      uploadedImage: null,
      categories: [],
    }),
    []
  );

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
          .select('id, name, description, created_at, parent_id')
          .order('name');

        if (error) {
          throw error;
        }
        if (!data) {
          throw new Error('Δεν ελήφθησαν δεδομένα');
        }

        const categoriesData = data.map((cat) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          parent_id: cat.parent_id,
          created_at: cat.created_at,
        })) as Category[];

        const mainCategories = categoriesData.filter((cat) => !cat.parent_id);
        const grouped: GroupedCategory[] = mainCategories.map((main) => ({
          main,
          subcategories: categoriesData.filter((cat) => cat.parent_id === main.id),
        }));
        setCategories(categoriesData);
        setGroupedCategories(grouped);
      } catch (_error) {
        toast.error('Σφάλμα φόρτωσης κατηγοριών');
        onClose();
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [isOpen, onClose, supabase]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Παρακαλώ επιλέξτε μια έγκυρη εικόνα');
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error('Η εικόνα πρέπει να είναι μικρότερη από 5MB');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { data, error } = await supabase.storage.from('product-images').upload(filePath, file);

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('product-images').getPublicUrl(data.path);

    return publicUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Παρακαλώ επιλέξτε μια έγκυρη εικόνα');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error('Η εικόνα πρέπει να είναι μικρότερη από 5MB');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      uploadedImage: file,
      imageUrl: URL.createObjectURL(file),
    }));
    toast.success('Η εικόνα προστέθηκε επιτυχώς');
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => {
      const updatedCategories = prev.categories.includes(value)
        ? prev.categories.filter((id) => id !== value)
        : [...prev.categories, value];

      return {
        ...prev,
        categories: updatedCategories,
        categoryId: updatedCategories.length > 0 ? (updatedCategories[0] ?? '') : '',
      };
    });
  };

  const validateForm = (formState: FormData) => {
    const { name, price, stock, isUnlimited } = formState;
    if (!name.trim()) {
      throw new Error('Το όνομα είναι υποχρεωτικό');
    }

    const priceValue = Number.parseFloat(price);
    if (Number.isNaN(priceValue) || priceValue < 0) {
      throw new Error('Η τιμή πρέπει να είναι θετικός αριθμός');
    }

    const stockValue = isUnlimited ? UNLIMITED_STOCK : Number.parseInt(stock, 10);
    if (!isUnlimited && (Number.isNaN(stockValue) || stockValue < 0)) {
      throw new Error('Το απόθεμα πρέπει να είναι θετικός αριθμός');
    }
    return { priceValue, stockValue };
  };

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Σφάλμα ταυτοποίησης');
    }
    return user;
  };

  const uploadImage = (image: File) => {
    return handleImageUpload(image);
  };

  type InsertCodeOptions = {
    name: string;
    price: number;
    stock_quantity: number;
    category_id: string | null;
    image_url: string | null;
    created_by: string;
    categories: string[];
  };

  const insertCode = async (options: InsertCodeOptions) => {
    const { error: insertError } = await supabase.from('products').insert([options]);
    if (insertError) {
      throw insertError;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { name, categories: formCategories, uploadedImage } = formData;

      const { priceValue, stockValue } = validateForm(formData);
      const user = await getUser();

      const imageUrl = uploadedImage ? await uploadImage(uploadedImage) : null;

      const primaryCategoryId: string | null = formCategories[0] ?? null;

      await insertCode({
        name: name.trim(),
        price: priceValue,
        stock_quantity: stockValue,
        category_id: primaryCategoryId,
        image_url: imageUrl,
        created_by: user.id,
        categories: formCategories,
      });

      toast.success('Code added successfully');
      router.refresh();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : API_ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryOptions = (groupedCats: GroupedCategory[]) => {
    return groupedCats.map(({ main, subcategories }) => (
      <SelectGroup key={main.id}>
        <SelectLabel className="font-semibold">{main.name}</SelectLabel>
        <SelectItem className="pl-6" value={main.id}>
          {main.name}
        </SelectItem>
        {subcategories.map((sub) => (
          <SelectItem className="pl-8" key={sub.id} value={sub.id}>
            {sub.name}
          </SelectItem>
        ))}
      </SelectGroup>
    ));
  };

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className={STYLES.dialog.content}>
        <DialogHeader className={STYLES.dialog.header}>
          <DialogTitle>Προσθήκη Νέου Προϊόντος</DialogTitle>
          <DialogDescription>Συμπληρώστε τις λεπτομέρειες του προϊόντος παρακάτω</DialogDescription>
        </DialogHeader>

        <form className={STYLES.form.container} onSubmit={handleSubmit}>
          {/* Product Name */}
          <div className={STYLES.form.field.container}>
            <Label htmlFor="name">Όνομα Προϊόντος</Label>
            <Input
              className={STYLES.form.field.input.base}
              id="name"
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Εισάγετε όνομα προϊόντος"
              required
              value={formData.name}
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className={STYLES.form.field.container}>
              <Label htmlFor="price">Τιμή (€)</Label>
              <Input
                className={STYLES.form.field.input.base}
                id="price"
                min="0"
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                required
                step="0.01"
                type="number"
                value={formData.price}
              />
            </div>

            <div className={STYLES.form.field.container}>
              <Label htmlFor="stock">Απόθεμα</Label>
              <div className="flex items-center gap-2">
                <Input
                  className={STYLES.form.field.input.base}
                  disabled={formData.isUnlimited}
                  id="stock"
                  min="0"
                  onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                  placeholder="Ποσότητα"
                  required={!formData.isUnlimited}
                  type="number"
                  value={formData.stock}
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.isUnlimited}
                    id="unlimited"
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        isUnlimited: checked as boolean,
                        stock: checked ? '' : prev.stock,
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
              onValueChange={(value) => handleCategoryChange(value)}
              value={formData.categories[0] || ''}
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
                {formData.categories.map((categoryId) => {
                  const category = categories.find((cat) => cat.id === categoryId);
                  return (
                    <div
                      className="flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm"
                      key={categoryId}
                    >
                      <span>{category?.name}</span>
                      <button
                        className="hover:text-destructive"
                        onClick={() => handleCategoryChange(categoryId)}
                        type="button"
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
                formData.imageUrl ? 'border-primary' : 'border-border hover:border-primary'
              )}
            >
              {formData.imageUrl ? (
                <>
                  <Image
                    alt="Preview"
                    className={STYLES.image.preview}
                    height={200}
                    src={formData.imageUrl}
                    width={200}
                  />
                  <button
                    className={STYLES.image.remove}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        imageUrl: null,
                        uploadedImage: null,
                      }))
                    }
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <label className={STYLES.image.placeholder} htmlFor="image">
                  <ImagePlus className="h-8 w-8 opacity-50" />
                  <span className="text-sm">Κάντε κλικ για μεταφόρτωση εικόνας</span>
                  <input
                    accept="image/*"
                    className="sr-only"
                    id="image"
                    onChange={handleImageChange}
                    type="file"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-2">
            <LoadingButton disabled={isLoadingCategories} loading={loading} type="submit">
              ΑΠΟΘΗΚΕΥΣΗ
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
