'use client';

import { ImagePlus, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
import { API_ERROR_MESSAGES, BUTTON_LABELS, UNLIMITED_STOCK } from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase';
import { cn } from '@/lib/utils/format';
import type { Database } from '@/types/supabase';

// Types
type CategoryRow = Database['public']['Tables']['categories']['Row'];
type ProductRow = Database['public']['Tables']['products']['Row'];
type Code = Pick<ProductRow, 'id' | 'name' | 'price' | 'image_url' | 'category_id'> & {
  stock: number;
};

type Category = CategoryRow & {
  parent: CategoryRow | null;
};

type GroupedCategory = {
  main: Category;
  subcategories: Category[];
};

type EditCodeDialogProps = {
  code: Code;
  onClose: () => void;
};

// Constants
const MAX_IMAGE_SIZE_MB = 5;
const BYTES_IN_KB = 1024;
const KB_IN_MB = 1024;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * KB_IN_MB * BYTES_IN_KB;

const STYLES = {
  form: {
    container: 'space-y-4 md:space-y-6',
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

export default function EditCodeDialog({ code, onClose }: EditCodeDialogProps) {
  const router = useRouter();
  const supabase = createClientSupabase();

  // Form state
  const [formData, setFormData] = useState({
    name: code.name,
    price: code.price.toString(),
    stock: code.stock === UNLIMITED_STOCK ? '' : code.stock.toString(),
    categoryId: code.category_id,
    isUnlimited: code.stock === UNLIMITED_STOCK,
    imageUrl: code.image_url,
    uploadedImage: null as File | null,
  });

  // Categories state
  const [_categories, setCategories] = useState<Category[]>([]);
  const [groupedCategories, setGroupedCategories] = useState<GroupedCategory[]>([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('No authenticated user');
        }

        const { data, error } = await supabase
          .from('categories')
          .select(`
            id, name, description, created_at, parent_id, created_by,
            parent:categories!categories_parent_id_fkey (id, name, description, created_at, parent_id, created_by)
          `)
          .order('name');

        if (error) {
          throw error;
        }
        if (!data) {
          throw new Error('No data received');
        }

        const categories = (data || []).map((raw) => {
          const parentRel = (raw as unknown as { parent?: CategoryRow | null }).parent;
          return {
            id: raw.id,
            name: raw.name,
            description: raw.description,
            created_at: raw.created_at,
            parent_id: raw.parent_id,
            created_by: raw.created_by,
            parent: parentRel && !Array.isArray(parentRel) ? parentRel : null,
          } as Category;
        });

        const mainCategories = categories.filter((cat) => !cat.parent_id);
        const grouped = mainCategories.map((main) => ({
          main,
          subcategories: categories.filter((cat) => cat.parent_id === main.id),
        }));

        setCategories(categories);
        setGroupedCategories(grouped);
      } catch (_error) {
        toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
        onClose();
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [onClose, supabase]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select a valid image');
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error('Image must be under 5MB');
    }

    const fileExt = file.name.split('.').pop();
    const RANDOM_STRING_LENGTH = 2;
    const BASE_36_RADIX = 36;
    const fileName = `new-${Math.random().toString(BASE_36_RADIX).slice(RANDOM_STRING_LENGTH)}.${fileExt}`;

    const { data, error } = await supabase.storage.from('product-images').upload(fileName, file);

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
      toast.error('Please select a valid image');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error('Image must be under 5MB');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      uploadedImage: file,
      imageUrl: URL.createObjectURL(file),
    }));
    toast.success('Image added successfully');
  };

  const validateForm = (name: string, price: string, stock: string, isUnlimited: boolean) => {
    if (!name.trim()) {
      throw new Error('Name is required');
    }

    const priceValue = Number.parseFloat(price);
    if (Number.isNaN(priceValue) || priceValue < 0) {
      throw new Error('Price must be a positive number');
    }

    const stockValue = isUnlimited ? UNLIMITED_STOCK : Number.parseInt(stock, 10);
    if (!isUnlimited && (Number.isNaN(stockValue) || stockValue < 0)) {
      throw new Error('Stock must be a positive number');
    }

    return { priceValue, stockValue };
  };

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required');
    }
    return user;
  };

  const uploadImage = (uploadedImage: File | null, currentImageUrl: string | null) => {
    return uploadedImage ? handleImageUpload(uploadedImage) : currentImageUrl;
  };

  type UpdateCodeOptions = {
    name: string;
    price: number;
    stock_quantity: number;
    category_id: string | null;
    image_url: string | null;
  };

  const updateCode = async (id: string, options: UpdateCodeOptions) => {
    const { error: updateError } = await supabase
      .from('products')
      .update({
        ...options,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { name, price, stock, categoryId, isUnlimited, uploadedImage } = formData;

      const { priceValue, stockValue } = validateForm(name, price, stock, isUnlimited);
      await getUser();

      const imageUrl = await uploadImage(uploadedImage, formData.imageUrl);

      await updateCode(code.id, {
        name: name.trim(),
        price: priceValue,
        stock_quantity: stockValue,
        category_id: categoryId || null,
        image_url: imageUrl,
      });

      toast.success('Code updated successfully');
      router.refresh();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : API_ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={onClose} open={true}>
      <DialogContent className={STYLES.dialog.content}>
        <DialogHeader className={STYLES.dialog.header}>
          <DialogTitle>Edit Code</DialogTitle>
          <DialogDescription>Update the code details below.</DialogDescription>
        </DialogHeader>

        <form className={STYLES.form.container} onSubmit={handleSubmit}>
          <div className={STYLES.form.field.container}>
            <Label htmlFor="name">Name</Label>
            <Input
              className={STYLES.form.field.input.base}
              id="name"
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter code name"
              value={formData.name}
            />
          </div>

          <div className={STYLES.form.field.container}>
            <Label htmlFor="price">Price (€)</Label>
            <Input
              className={STYLES.form.field.input.base}
              id="price"
              min="0"
              onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
              step="0.01"
              type="number"
              value={formData.price}
            />
          </div>

          <div className={STYLES.form.field.container}>
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
              <Label htmlFor="unlimited">Unlimited stock</Label>
            </div>
          </div>

          {!formData.isUnlimited && (
            <div className={STYLES.form.field.container}>
              <Label htmlFor="stock">Stock</Label>
              <Input
                className={STYLES.form.field.input.base}
                id="stock"
                min="0"
                onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                placeholder="Enter stock quantity"
                type="number"
                value={formData.stock}
              />
            </div>
          )}

          <div className={STYLES.form.field.container}>
            <Label htmlFor="category">Category</Label>
            <Select
              disabled={isLoadingCategories}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
              value={formData.categoryId ?? ''}
            >
              <SelectTrigger className={STYLES.select.container}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {groupedCategories.map(({ main, subcategories }) => (
                  <SelectGroup key={main.id}>
                    <SelectLabel className={STYLES.select.group.label}>{main.name}</SelectLabel>
                    {subcategories.length > 0 ? (
                      subcategories.map((sub) => (
                        <SelectItem
                          className={STYLES.select.group.item}
                          key={sub.id}
                          value={sub.id}
                        >
                          {sub.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem className={STYLES.select.group.item} value={main.id}>
                        {main.name}
                      </SelectItem>
                    )}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className={STYLES.form.field.container}>
            <Label>Image</Label>
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
                  <span className="text-sm">Click to upload image</span>
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

          <div className="flex justify-end gap-2 pt-2">
            <LoadingButton disabled={isLoadingCategories} loading={loading} type="submit">
              {BUTTON_LABELS.SAVE}
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
