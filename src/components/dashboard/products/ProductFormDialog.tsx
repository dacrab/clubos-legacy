import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Product, Category } from '@/types/products';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  categories?: Category[];
  onProductSaved?: () => void;
}

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  costPrice: string;
  stock: string;
  minStockLevel: string;
  categoryId: string;
  barcode: string;
  imageUrl: string;
  imageFile?: File;
  isActive: boolean;
  trackInventory: boolean;
}

const FORM_LABELS = {
  NAME: 'Όνομα',
  DESCRIPTION: 'Περιγραφή',
  PRICE: 'Τιμή',
  COST_PRICE: 'Τιμή Κόστους',
  STOCK: 'Απόθεμα',
  MIN_STOCK_LEVEL: 'Ελάχιστο Απόθεμα',
  CATEGORY: 'Κατηγορία',
  BARCODE: 'Barcode',
  IMAGE: 'Εικόνα',
  IS_ACTIVE: 'Ενεργό',
  TRACK_INVENTORY: 'Παρακολούθηση Αποθέματος'
} as const;

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  price: '',
  costPrice: '',
  stock: '0',
  minStockLevel: '0',
  categoryId: '',
  barcode: '',
  imageUrl: '',
  isActive: true,
  trackInventory: true,
};

const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  const data = await response.json();
  return data.url;
};

export default function ProductFormDialog({ 
  open, 
  onOpenChange, 
  product, 
  categories = [], 
  onProductSaved 
}: ProductFormDialogProps) {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const isEditMode = Boolean(product);

  // Reset form when dialog opens/closes or product changes
  useEffect(() => {
    if (open) {
      if (product) {
        setFormData({
          name: product.name,
          description: product.description || '',
          price: product.price.toString(),
          costPrice: product.costPrice?.toString() || '',
          stock: product.stock.toString(),
          minStockLevel: product.minStockLevel.toString(),
          categoryId: product.categoryId || '',
          barcode: product.barcode || '',
          imageUrl: product.imageUrl || '',
          isActive: product.isActive,
          trackInventory: product.trackInventory,
        });
      } else {
        setFormData(initialFormData);
      }
      setImageFile(null);
    }
  }, [open, product]);

  const handleInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) {return;}

    setLoading(true);
    try {
      let imageUrl = formData.imageUrl;

      // Upload image if a new one was selected
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const productData = {
        ...formData,
        imageUrl,
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        stock: parseInt(formData.stock),
        minStockLevel: parseInt(formData.minStockLevel),
      };

      const endpoint = isEditMode && product ? `/api/products/${product.id}` : '/api/products';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save product');
      }

      toast.success(isEditMode ? 'Το προϊόν ενημερώθηκε επιτυχώς' : 'Το προϊόν δημιουργήθηκε επιτυχώς');
      onProductSaved?.();
      onOpenChange(false);
    } catch (error) {
      (await import('@/lib/utils/logger')).logger.error('Error saving product:', error);
      toast.error(error instanceof Error ? error.message : 'Αποτυχία αποθήκευσης προϊόντος');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Επεξεργασία Προϊόντος' : 'Νέο Προϊόν'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{FORM_LABELS.NAME} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">{FORM_LABELS.CATEGORY}</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleInputChange('categoryId', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε κατηγορία" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{FORM_LABELS.DESCRIPTION}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{FORM_LABELS.PRICE} *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="costPrice">{FORM_LABELS.COST_PRICE}</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => handleInputChange('costPrice', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">{FORM_LABELS.STOCK}</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minStockLevel">{FORM_LABELS.MIN_STOCK_LEVEL}</Label>
              <Input
                id="minStockLevel"
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => handleInputChange('minStockLevel', e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">{FORM_LABELS.BARCODE}</Label>
            <Input
              id="barcode"
              value={formData.barcode}
              onChange={(e) => handleInputChange('barcode', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">{FORM_LABELS.IMAGE}</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
            />
            {formData.imageUrl && (
              <p className="text-sm text-muted-foreground">
                Τρέχουσα εικόνα: {formData.imageUrl}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked === true)}
                disabled={loading}
              />
              <Label htmlFor="isActive">{FORM_LABELS.IS_ACTIVE}</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="trackInventory"
                checked={formData.trackInventory}
                onCheckedChange={(checked) => handleInputChange('trackInventory', checked === true)}
                disabled={loading}
              />
              <Label htmlFor="trackInventory">{FORM_LABELS.TRACK_INVENTORY}</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Ακύρωση
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Αποθήκευση...' : 'Αποθήκευση'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 