"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClientSupabase } from "@/lib/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { X, ImagePlus, Loader2 } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { UNLIMITED_STOCK, API_ERROR_MESSAGES } from "@/lib/constants";
import Image from "next/image";
import { useCategories } from "@/hooks/data/useCategories";
import type { Product, Category, GroupedCategory } from "@/types/products";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormControl } from "@/components/ui/form";

interface ProductFormDialogProps {
  product?: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  name: string;
  price: string;
  stock: string;
  isUnlimited: boolean;
  imageUrl: string | null;
  uploadedImage: File | null;
  category_id: string | null;
}

const STYLES = {
  form: { container: "space-y-4 md:space-y-6" },
  image: {
    container: "relative flex items-center justify-center w-full h-28 sm:h-32 md:h-40 border-2 border-dashed rounded-lg transition-all",
    preview: "absolute inset-0 w-full h-full object-contain p-2",
    placeholder: "flex flex-col items-center justify-center gap-1.5 md:gap-2 text-muted-foreground",
    remove: "absolute top-1 right-1 md:top-2 md:right-2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors"
  },
  select: {
    group: {
      label: "px-2 py-1.5 text-xs md:text-sm font-semibold text-muted-foreground",
      item: "pl-4 md:pl-6 text-sm md:text-base"
    }
  },
  dialog: {
    content: "w-[95vw] max-w-[425px] p-3 sm:p-4 md:p-6 gap-3 sm:gap-4 md:gap-6 max-h-[90vh] overflow-y-auto"
  }
};

export default function ProductFormDialog({ product: productToEdit, open, onOpenChange }: ProductFormDialogProps) {
  const router = useRouter();
  const supabase = createClientSupabase();
  const isEditMode = useMemo(() => !!productToEdit, [productToEdit]);

  const getInitialFormState = useCallback((): FormData => ({
    name: productToEdit?.name ?? "",
    price: productToEdit?.price?.toString() ?? "",
    stock: productToEdit?.stock === UNLIMITED_STOCK ? "" : productToEdit?.stock?.toString() ?? "",
    isUnlimited: productToEdit?.stock === UNLIMITED_STOCK,
    imageUrl: productToEdit?.image_url ?? null,
    uploadedImage: null,
    category_id: productToEdit?.category_id ?? null,
  }), [productToEdit]);

  const [formData, setFormData] = useState<FormData>(getInitialFormState());
  const { categories, groupedCategories, isLoading: isLoadingCategories } = useCategories();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (open) {
      setFormData(getInitialFormState());
    }
  }, [open, getInitialFormState]);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) throw new Error('Παρακαλώ επιλέξτε μια έγκυρη εικόνα');
    if (file.size > 5 * 1024 * 1024) throw new Error('Η εικόνα πρέπει να είναι μικρότερη από 5MB');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    const { data, error } = await supabase.storage.from('products').upload(filePath, file);
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(data.path);
    return publicUrl;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFormData(prev => ({ ...prev, uploadedImage: file, imageUrl: URL.createObjectURL(file) }));
    toast.success('Η εικόνα προστέθηκε επιτυχώς');
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      category_id: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { name, price, stock, isUnlimited, uploadedImage } = formData;
      if (!name.trim()) throw new Error('Το όνομα είναι υποχρεωτικό');
      
      const priceValue = parseFloat(price);
      if (isNaN(priceValue) || priceValue < 0) throw new Error('Η τιμή πρέπει να είναι θετικός αριθμός');
      
      const stockValue = isUnlimited ? UNLIMITED_STOCK : parseInt(stock, 10);
      if (!isUnlimited && (isNaN(stockValue) || stockValue < 0)) throw new Error('Το απόθεμα πρέπει να είναι θετικός αριθμός');
      
      let finalImageUrl = formData.imageUrl;
      if (uploadedImage) finalImageUrl = await handleImageUpload(uploadedImage);
      
      const productData = {
        name: name.trim(),
        price: priceValue,
        stock: stockValue,
        category_id: formData.category_id,
        image_url: finalImageUrl,
        updated_at: new Date().toISOString(),
      };

      if (productToEdit) {
        const { error } = await supabase.from('products').update(productData).eq('id', productToEdit.id);
        if (error) throw error;
        toast.success('Product updated successfully');
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Σφάλμα ταυτοποίησης');
        const { error } = await supabase.from('products').insert({ ...productData, created_by: user.id });
        if (error) throw error;
        toast.success('Product created successfully');
      }

      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error instanceof Error ? error.message : API_ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryOptions = (cats: GroupedCategory[]) => cats.map(({ main, subcategories }) => (
    <SelectGroup key={main.id}>
      <SelectLabel className={STYLES.select.group.label}>{main.name}</SelectLabel>
      <SelectItem value={main.id} className={STYLES.select.group.item}>{main.name}</SelectItem>
      {subcategories.map((sub: Category) => (
        <SelectItem key={sub.id} value={sub.id} className="pl-8">{sub.name}</SelectItem>
      ))}
    </SelectGroup>
  ));
  
  const selectedCategory = useMemo(() => (
    formData.category_id ? categories.find(cat => cat.id === formData.category_id) : null
  ), [formData.category_id, categories]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={STYLES.dialog.content}>
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Επεξεργασία Προϊόντος" : "Προσθήκη Νέου Προϊόντος"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Ενημερώστε τις λεπτομέρειες παρακάτω." : "Συμπληρώστε τις λεπτομέρειες του προϊόντος."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className={STYLES.form.container}>
          <div className="space-y-1.5 md:space-y-2">
            <Label htmlFor="name">Όνομα Προϊόντος</Label>
            <Input id="name" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="price">Τιμή (€)</Label>
              <Input id="price" type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData(p => ({...p, price: e.target.value}))} required />
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="stock">Απόθεμα</Label>
              <Input id="stock" type="number" min="0" value={formData.stock} onChange={e => setFormData(p => ({...p, stock: e.target.value}))} disabled={formData.isUnlimited} required={!formData.isUnlimited} />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="unlimited" checked={formData.isUnlimited} onCheckedChange={checked => setFormData(p => ({...p, isUnlimited: !!checked, stock: checked ? "" : p.stock, category_id: p.category_id}))} />
            <Label htmlFor="unlimited">Απεριόριστο απόθεμα</Label>
          </div>
          
          <div className="space-y-1.5 md:space-y-2">
            <Label>Κατηγορία</Label>
            <Select onValueChange={handleCategoryChange} value={formData.category_id ?? ""}>
              <SelectTrigger><SelectValue placeholder="Επιλέξτε κατηγορία" /></SelectTrigger>
              <SelectContent>
                {isLoadingCategories ? <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div> : renderCategoryOptions(groupedCategories)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <Label>Εικόνα Προϊόντος</Label>
            <div className={cn(STYLES.image.container, formData.imageUrl && "border-primary")}>
              {formData.imageUrl ? (
                <>
                  <Image src={formData.imageUrl} alt="Preview" width={200} height={200} className={STYLES.image.preview} />
                  <button type="button" onClick={() => setFormData(p => ({...p, imageUrl: null, uploadedImage: null}))} className={STYLES.image.remove}>
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <label htmlFor="image" className={STYLES.image.placeholder}>
                  <ImagePlus className="h-8 w-8 opacity-50" />
                  <span className="text-sm">Μεταφόρτωση εικόνας</span>
                  <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <LoadingButton type="submit" loading={loading} disabled={isLoadingCategories}>Αποθήκευση</LoadingButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 