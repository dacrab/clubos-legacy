"use client";

import { X, ImagePlus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { 
  UNLIMITED_STOCK,
  BUTTON_LABELS,
  API_ERROR_MESSAGES
} from "@/lib/constants";
import { createClientSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { type Database } from "@/types/supabase";


// Types
type CategoryRow = Database['public']['Tables']['categories']['Row'];
type Code = Database['public']['Tables']['codes']['Row'];

type Category = CategoryRow & {
  parent: CategoryRow | null;
};

type GroupedCategory = {
  main: Category;
  subcategories: Category[];
};

interface EditCodeDialogProps {
  code: Code;
  onClose: () => void;
}

// Constants
const STYLES = {
  form: {
    container: "space-y-4 md:space-y-6",
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

export default function EditCodeDialog({ code, onClose }: EditCodeDialogProps) {
  const router = useRouter();
  const supabase = createClientSupabase() as any;

  // Form state
  const [formData, setFormData] = useState({
    name: code.name,
    price: code.price.toString(),
    stock: code.stock === UNLIMITED_STOCK ? '' : code.stock.toString(),
    categoryId: code.category_id,
    isUnlimited: code.stock === UNLIMITED_STOCK,
    imageUrl: code.image_url,
    uploadedImage: null as File | null
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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {throw new Error('No authenticated user');}

        const { data, error } = await supabase
          .from('categories')
          .select(`
            id, name, description, created_at, parent_id, created_by,
            parent:parent_id (id, name, description, created_at, parent_id, created_by)
          `)
          .order('name');

        if (error) {throw error;}
        if (!data) {throw new Error('No data received');}

        const categories = data.filter(Boolean).map((cat: Category) => ({
          ...cat,
          parent: cat.parent && !Array.isArray(cat.parent) ? cat.parent : null
        })) as Category[];

        const mainCategories = categories.filter(cat => !cat.parent_id);
        const grouped = mainCategories.map(main => ({
          main,
          subcategories: categories.filter(cat => cat.parent_id === main.id)
        }));

        setCategories(categories);
        setGroupedCategories(grouped);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
        onClose();
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    void fetchCategories();
  }, [onClose, supabase]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select a valid image');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image must be under 5MB');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (error) {throw error;}

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {return;}

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setFormData(prev => ({
      ...prev,
      uploadedImage: file,
      imageUrl: URL.createObjectURL(file)
    }));
    toast.success('Image added successfully');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { name, price, stock, categoryId, isUnlimited, uploadedImage } = formData;

      if (!name.trim()) {throw new Error('Name is required');}

      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue < 0) {throw new Error('Price must be a positive number');}

      let stockValue = isUnlimited ? UNLIMITED_STOCK : parseInt(stock);
      if (!isUnlimited && (isNaN(stockValue) || stockValue < 0)) {
        throw new Error('Stock must be a positive number');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {throw new Error('Authentication required');}

      let imageUrl = formData.imageUrl;
      if (uploadedImage) {
        imageUrl = await handleImageUpload(uploadedImage);
      }

      const { error: updateError } = await supabase
        .from('codes')
        .update({
          name: name.trim(),
          price: priceValue,
          stock: stockValue,
          category_id: categoryId || null,
          image_url: imageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', code.id);

      if (updateError) {throw updateError;}

      toast.success('Code updated successfully');
      router.refresh();
      onClose();
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error instanceof Error ? error.message : API_ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={STYLES.dialog.content}>
        <DialogHeader className={STYLES.dialog.header}>
          <DialogTitle>Edit Code</DialogTitle>
          <DialogDescription>
            Update the code details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={STYLES.form.container}>
          <div className={STYLES.form.field.container}>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className={STYLES.form.field.input.base}
              placeholder="Enter code name"
            />
          </div>

          <div className={STYLES.form.field.container}>
            <Label htmlFor="price">Price (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className={STYLES.form.field.input.base}
              placeholder="0.00"
            />
          </div>

          <div className={STYLES.form.field.container}>
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
              <Label htmlFor="unlimited">Unlimited stock</Label>
            </div>
          </div>

          {!formData.isUnlimited && (
            <div className={STYLES.form.field.container}>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                className={STYLES.form.field.input.base}
                placeholder="Enter stock quantity"
              />
            </div>
          )}

          <div className={STYLES.form.field.container}>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.categoryId || undefined}
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              disabled={isLoadingCategories}
            >
              <SelectTrigger className={STYLES.select.container}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {groupedCategories.map(({ main, subcategories }) => (
                  <SelectGroup key={main.id}>
                    <SelectLabel className={STYLES.select.group.label}>
                      {main.name}
                    </SelectLabel>
                    {subcategories.length > 0 ? (
                      subcategories.map(sub => (
                        <SelectItem
                          key={sub.id}
                          value={sub.id}
                          className={STYLES.select.group.item}
                        >
                          {sub.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem
                        value={main.id}
                        className={STYLES.select.group.item}
                      >
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
                  <span className="text-sm">Click to upload image</span>
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

          <div className="flex justify-end gap-2 pt-2">
            <LoadingButton
              type="submit"
              loading={loading}
              disabled={isLoadingCategories}
            >
              {BUTTON_LABELS.SAVE}
            </LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}