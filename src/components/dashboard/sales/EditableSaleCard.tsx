"use client";

import { useEffect, useState } from "react";
import { Pencil, X, Save, Trash2, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils/number";
import { formatDateWithGreekAmPm } from "@/lib/utils/date";
import { SALES_MESSAGES } from "@/lib/constants";
import { SaleWithDetails, Product } from "@/types/sales";
import { createClientSupabase } from "@/lib/supabase/client";
import { useSaleActions } from '@/hooks/features/sales/useSaleActions';
import { OrderItem } from "./components/OrderItem";
import { calculateGroupTotals } from "@/lib/utils/salesUtils";

// Constants
const EDIT_WINDOW_MINUTES = 5;

// Types
interface EditSaleFormProps {
  sale: SaleWithDetails;
  onSave: (updatedSale: Partial<SaleWithDetails>) => Promise<void>;
  onCancel: () => void;
}

export interface EditableSaleCardProps {
  sale: SaleWithDetails;
  onDeleteClick?: (id: string) => void;
}

/**
 * Format time remaining for edit window
 */
const formatTimeRemaining = (diffInMinutes: number): string => {
  const remainingMinutes = Math.floor(EDIT_WINDOW_MINUTES - diffInMinutes);
  const remainingSeconds = Math.floor((EDIT_WINDOW_MINUTES - diffInMinutes) * 60 % 60);
  return `${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Badge component for displaying sale status
 */
function SaleStatusBadge({ 
  isDeleted, 
  isTreat, 
  isEdited, 
  originalProductCode, 
  originalQuantity 
}: { 
  isDeleted: boolean; 
  isTreat: boolean; 
  isEdited: boolean; 
  originalProductCode?: string; 
  originalQuantity?: number;
}) {
  if (isDeleted) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="destructive" className="flex items-center gap-1">
              <X className="h-3 w-3" />
              <span className="hidden sm:inline">Διαγράφηκε</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <p>Το προϊόν έχει διαγραφεί και δεν υπολογίζεται στο σύνολο.</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  if (isTreat) {
    return (
      <Badge variant="default" className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600">
        <Gift className="h-3 w-3" />
        <span className="hidden sm:inline">Κέρασμα</span>
      </Badge>
    );
  }
  
  if (isEdited) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Pencil className="h-3 w-3" />
              <span className="hidden sm:inline">Επεξεργασμένο</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1">
              <p>Αρχικό προϊόν: {originalProductCode || 'N/A'}</p>
              <p>Αρχική ποσότητα: {originalQuantity} τεμ.</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return null;
}

/**
 * Form component for editing a sale
 */
function EditSaleForm({ sale, onSave, onCancel }: EditSaleFormProps) {
  const [quantity, setQuantity] = useState(sale.quantity);
  const [selectedProductId, setSelectedProductId] = useState(sale.code_id);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTreat, setIsTreat] = useState(sale.is_treat);

  const supabase = createClientSupabase();

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const { data: rawData, error } = await supabase
          .from('codes')
          .select(`
            id, name, price, stock, image_url, category_id, created_at, created_by, updated_at,
            category:categories!inner (id, name, description, parent_id, created_at, created_by)
          `)
          .order('name');
        
        if (error) throw error;
        
        if (rawData) {
          // Use type assertion to handle the complex structure
          const transformedData: Product[] = rawData.map((product: any) => ({
            ...product,
            // Handle category field which might be an array or an object
            category: Array.isArray(product.category) && product.category.length > 0 
              ? product.category[0] 
              : product.category || undefined
          }));

          setAvailableProducts(transformedData);
          setSelectedProduct(transformedData.find(p => p.id === selectedProductId) || null);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [selectedProductId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await onSave({
        ...sale,
        quantity,
        code_id: selectedProduct.id,
        total_price: selectedProduct.price * quantity,
        unit_price: selectedProduct.price,
        is_treat: isTreat,
        product: selectedProduct
      });
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-muted-foreground">Επεξεργασία Πώλησης</h4>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-6 w-6 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Προϊόν</Label>
              <Select
                value={selectedProductId}
                onValueChange={(value) => setSelectedProductId(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {availableProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {product.price}€
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ποσότητα</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="is-treat" 
              checked={isTreat} 
              onCheckedChange={(checked) => setIsTreat(!!checked)}
            />
            <Label
              htmlFor="is-treat"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1.5"
            >
              <Gift className="h-4 w-4 text-amber-500" />
              Κέρασμα
            </Label>
          </div>

          <div className="flex items-center justify-between pt-2">
            {selectedProduct && (
              <p className="text-sm font-medium">
                Σύνολο: <span className={cn(
                  "text-primary", 
                  isTreat && "line-through text-muted-foreground"
                )}>
                  {(selectedProduct.price * quantity).toFixed(2)}€
                </span>
                {isTreat && <span className="text-amber-500 ml-2">Δωρεάν</span>}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={!selectedProduct || isLoading}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                Αποθήκευση
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * EditableSaleCard component for displaying and editing sales
 */
export default function EditableSaleCard({ sale, onDeleteClick }: EditableSaleCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEdited, setIsEdited] = useState(sale.is_edited || false);
  const [isDeleted, setIsDeleted] = useState(sale.is_deleted || false);
  const [error, setError] = useState<string | null>(null);
  const [currentSale, setCurrentSale] = useState(sale);
  const [canEdit, setCanEdit] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  const router = useRouter();
  const supabase = createClientSupabase();
  
  // Use the shared sale actions hook
  const { isLoading, deleteSale, editSale } = useSaleActions({
    onSuccess: () => {
      router.refresh();
    }
  });

  // Check if sale is still editable (within the time window)
  useEffect(() => {
    const checkEditability = () => {
      const saleDate = new Date(currentSale.created_at);
      const now = new Date();
      const diffInMinutes = (now.getTime() - saleDate.getTime()) / 1000 / 60;
      
      if (diffInMinutes < EDIT_WINDOW_MINUTES) {
        setCanEdit(true);
        setTimeLeft(formatTimeRemaining(diffInMinutes));
      } else {
        setCanEdit(false);
        setTimeLeft('');
      }
    };

    checkEditability();
    const interval = setInterval(checkEditability, 1000);
    
    return () => clearInterval(interval);
  }, [currentSale.created_at]);

  // Handle delete using the shared hook
  const handleDelete = async (saleId: string) => {
    if (!canEdit) {
      toast.error(SALES_MESSAGES.EDIT_WINDOW_EXPIRED);
      return;
    }

    const success = await deleteSale(saleId);
    if (success) {
      setIsDeleted(true);
      
      // Call parent's onDeleteClick if provided
      if (onDeleteClick) {
        onDeleteClick(saleId);
      }
    }
  };

  // Handle edit using the shared hook
  const handleEdit = async (updatedSale: Partial<SaleWithDetails>) => {
    if (!canEdit) {
      toast.error(SALES_MESSAGES.EDIT_WINDOW_EXPIRED);
      return;
    }

    if (!updatedSale.code_id) {
      toast.error(SALES_MESSAGES.PRODUCT_NOT_FOUND);
      return;
    }

    try {
      // Check if new product exists in database
      const { data: newProductData, error: productError } = await supabase
        .from('codes')
        .select('*, category:categories(*)')
        .eq('id', updatedSale.code_id)
        .single();

      if (productError || !newProductData) {
        throw new Error(SALES_MESSAGES.PRODUCT_NOT_FOUND);
      }

      // Get old product for stock management
      const { data: oldProductData } = await supabase
        .from('codes')
        .select('stock')
        .eq('id', currentSale.code_id)
        .single();

      const newProduct = { ...newProductData, category: newProductData.category };

      const oldProduct = {
        stock: oldProductData?.stock || -1
      };

      // Treat status changed?
      const treatStatusChanged = currentSale.is_treat !== updatedSale.is_treat;

      // Calculate prices
      const unitPrice = newProduct.price;
      const totalPrice = unitPrice * updatedSale.quantity!;
      
      // Use the editSale function from the hook
      const success = await editSale(currentSale.id, currentSale, {
        quantity: updatedSale.quantity,
        code_id: updatedSale.code_id,
        unit_price: unitPrice,
        total_price: totalPrice,
        is_treat: updatedSale.is_treat
      });
      
      if (success) {
        // Handle stock updates if necessary
        const needToUpdateStock = 
          updatedSale.code_id !== sale.code_id || 
          updatedSale.quantity !== sale.quantity ||
          (treatStatusChanged && !updatedSale.is_treat);
        
        if (needToUpdateStock) {
          // Return stock to old product if not upgrading a treat to regular sale
          if (oldProduct.stock !== -1 && !(sale.is_treat && !updatedSale.is_treat)) {
            await supabase.from('codes')
              .update({ stock: oldProduct.stock + sale.quantity })
              .eq('id', sale.code_id);
          }

          // Take stock from new product if not creating a treat
          if (newProduct.stock !== -1 && !updatedSale.is_treat && updatedSale.code_id) {
            await supabase.from('codes')
              .update({ stock: newProduct.stock - updatedSale.quantity! })
              .eq('id', updatedSale.code_id);
          }
        }
        
        // Update local state
        setCurrentSale({
          ...currentSale,
          code_id: newProduct.id,
          quantity: updatedSale.quantity!,
          unit_price: unitPrice,
          total_price: totalPrice,
          is_edited: true,
          is_treat: !!updatedSale.is_treat,
          original_quantity: sale.quantity,
          original_code: sale.product?.name || null,
          product: {
            ...newProduct
          }
        });
        
        setIsEdited(true);
        setIsEditing(false);
        setError(null);
      }
    } catch (error: any) {
      console.error('Error updating sale:', error);
      setError(error.message || SALES_MESSAGES.UPDATE_ERROR);
      toast.error(error.message || SALES_MESSAGES.UPDATE_ERROR);
    }
  };

  if (!currentSale?.product?.name) {
    return (
      <Card className="bg-destructive/10">
        <CardContent className="p-3">
          <p className="text-sm text-destructive">Error: Invalid sale data</p>
        </CardContent>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <EditSaleForm 
        sale={currentSale}
        onSave={handleEdit}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Card className={cn(
      "group relative hover:shadow-sm transition-all",
      isDeleted && "opacity-75 bg-muted/40 border-dashed"
    )}>
      <CardContent className="p-3">
        <div className="flex justify-between items-center">
          {/* Left side: Product info */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {currentSale.product?.image_url && (
                <div className={cn(
                  "relative h-8 w-8",
                  isDeleted && "opacity-50"
                )}>
                  <Image
                    src={currentSale.product.image_url}
                    alt={currentSale.product.name}
                    fill
                    className="object-contain"
                    sizes="32px"
                  />
                </div>
              )}
              
              <p className={cn(
                "font-medium",
                isDeleted && "line-through text-muted-foreground"
              )}>
                {currentSale.product?.name}
              </p>
              
              {timeLeft && canEdit && (
                <Badge variant="secondary" className="text-xs">
                  {timeLeft}
                </Badge>
              )}
              
              <SaleStatusBadge 
                isDeleted={isDeleted} 
                isTreat={currentSale.is_treat} 
                isEdited={isEdited}
                originalProductCode={currentSale.original_code ?? undefined}
                originalQuantity={currentSale.original_quantity ?? undefined}
              />
            </div>
            
            <p className="text-sm text-muted-foreground">
              {currentSale.created_at ? formatDateWithGreekAmPm(new Date(currentSale.created_at)) : ''}
            </p>
            
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
          </div>
          
          {/* Right side: Actions and price */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                disabled={!canEdit || isDeleted || isLoading}
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              
              {!isDeleted && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDelete(sale.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                  disabled={!canEdit || isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Διαγραφή</span>
                </Button>
              )}
            </div>
            
            <div className="text-right">
              <p className={cn(
                "font-medium",
                isDeleted && "text-muted-foreground"
              )}>
                {currentSale.quantity} τεμ.
              </p>
              <p className={cn(
                "text-sm font-medium flex items-center gap-1 justify-end",
                isDeleted ? "text-muted-foreground line-through" : "text-primary"
              )}>
                {currentSale.is_treat ? (
                  <span className="text-amber-500">Δωρεάν</span>
                ) : (
                  formatPrice(currentSale.total_price)
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}