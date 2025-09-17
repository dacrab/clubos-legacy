'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { ProductImage } from '@/components/ui/product-image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEditability } from '@/hooks/use-editability';
import { useErrorHandling } from '@/hooks/use-error-handling';
import { useProductManagement } from '@/hooks/use-product-management';
import { useLoadingState } from '@/hooks/utils/use-loading-state';
import { PAYMENT_METHOD_LABELS, SALES_MESSAGES, UNLIMITED_STOCK } from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase/client';
import { formatDateWithGreekAmPm } from '@/lib/utils/date';
import { cn } from '@/lib/utils/format';
import { toast } from '@/lib/utils/toast';
import type { OrderItem, Product } from '@/types/database';

// Constants - removed TIME constants as they're now in useEditability hook

// Types
type EditableSaleCardProps = {
  orderItem: OrderItem & { product: Product };
  onUpdate: (updatedOrderItem: OrderItem) => void;
};

type OrderItemUpdate = Partial<OrderItem>;

type SimpleProduct = {
  id: string;
  name: string;
};

type EditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedOrderItem: OrderItemUpdate) => void;
  orderItem: OrderItem;
};

function EditDialog({ open, onOpenChange, onSave, orderItem }: EditDialogProps) {
  const [updatedOrderItem, setUpdatedOrderItem] = useState<OrderItemUpdate>({
    quantity: orderItem.quantity,
    product_id: orderItem.product_id,
    is_treat: orderItem.is_treat,
  });
  const [selectedProductId, setSelectedProductId] = useState<string>(orderItem.product_id);
  // Use custom hooks
  const { products, loading } = useProductManagement({
    isAdmin: false,
    autoFetch: open,
  });

  // Transform products for the select
  const simpleProducts: SimpleProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
  }));

  const handleSave = () => {
    if (!(selectedProductId && updatedOrderItem.quantity) || updatedOrderItem.quantity <= 0) {
      toast.error('Παρακαλώ συμπληρώστε όλα τα υποχρεωτικά πεδία');
      return;
    }

    onSave(updatedOrderItem);
    onOpenChange(false);
  };

  const handleFieldChange = (field: keyof OrderItemUpdate, value: unknown) => {
    setUpdatedOrderItem((prev: OrderItemUpdate) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProductChange = (productId: string) => {
    setSelectedProductId(productId);
    handleFieldChange('product_id', productId);
  };

  const handleQuantityChange = (value: string) => {
    const quantity = Number.parseInt(value, 10);
    if (!Number.isNaN(quantity) && quantity > 0) {
      handleFieldChange('quantity', quantity);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Επεξεργασία Πώλησης</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="product">Προϊόν *</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={loading}
              id="product"
              onChange={(e) => handleProductChange(e.target.value)}
              value={selectedProductId}
            >
              {simpleProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="quantity">Ποσότητα *</Label>
            <Input
              id="quantity"
              min="1"
              onChange={(e) => handleQuantityChange(e.target.value)}
              type="number"
              value={updatedOrderItem.quantity || ''}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              checked={updatedOrderItem.is_treat}
              id="is_treat"
              onChange={(e) => handleFieldChange('is_treat', e.target.checked)}
              type="checkbox"
            />
            <Label htmlFor="is_treat">Κέρασμα</Label>
          </div>
        </div>
        <DialogFooter>
          <LoadingButton
            disabled={loading || !selectedProductId || !updatedOrderItem.quantity}
            onClick={handleSave}
          >
            {loading ? 'Φόρτωση...' : 'Αποθήκευση'}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function EditableSaleCard({ orderItem, onUpdate }: EditableSaleCardProps) {
  // Component State
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleted, setIsDeleted] = useState(orderItem.is_deleted);
  const [_error, setError] = useState<string | null>(null);
  const [currentOrderItem, setCurrentOrderItem] = useState(orderItem);
  const router = useRouter();
  const supabase = createClientSupabase();

  // Use custom hooks
  const { canEdit } = useEditability({
    createdAt: currentOrderItem.created_at,
  });
  const { withLoading, loading: isLoading } = useLoadingState();
  const { handleError } = useErrorHandling({
    showToasts: true,
    defaultErrorMessage: 'Σφάλμα κατά την εκτέλεση της ενέργειας',
  });

  const deleteOrderItem = (_orderItemId: string): Promise<boolean> => {
    return withLoading(() => {
      try {
        router.refresh();
        return Promise.resolve(true);
      } catch (error) {
        handleError(error, 'Αποτυχία διαγραφής πώλησης');
        return Promise.resolve(false);
      }
    });
  };

  const editOrderItem = (_orderItemId: string, _updatedData: unknown): Promise<boolean> => {
    return withLoading(() => {
      try {
        router.refresh();
        return Promise.resolve(true);
      } catch (error) {
        handleError(error, 'Αποτυχία ενημέρωσης πώλησης');
        return Promise.resolve(false);
      }
    });
  };

  const validateUpdate = (updatedOrderItem: Partial<OrderItem>, newProduct: Product): void => {
    if (!updatedOrderItem.quantity || updatedOrderItem.quantity <= 0) {
      throw new Error('Η ποσότητα πρέπει να είναι μεγαλύτερη από 0');
    }

    if (
      newProduct.stock_quantity !== UNLIMITED_STOCK &&
      newProduct.stock_quantity < updatedOrderItem.quantity
    ) {
      throw new Error(SALES_MESSAGES.INSUFFICIENT_STOCK);
    }
  };

  const calculatePrices = (updatedOrderItem: Partial<OrderItem>, newProduct: Product) => {
    const unitPrice = newProduct.price;
    const lineTotal = unitPrice * (updatedOrderItem.quantity ?? 0);
    return { unitPrice, lineTotal };
  };

  const updateStock = async (
    originalOrderItem: OrderItem,
    updatedOrderItem: Partial<OrderItem>,
    newProduct: Product,
    originalProduct?: Product
  ) => {
    const quantityDifference =
      (updatedOrderItem.quantity ?? originalOrderItem.quantity) - originalOrderItem.quantity;

    if (quantityDifference === 0) {
      return; // No change in stock
    }

    // Restore stock for the original product
    if (
      originalOrderItem.product_id !== updatedOrderItem.product_id &&
      originalProduct &&
      originalProduct.stock_quantity !== UNLIMITED_STOCK
    ) {
      await supabase
        .from('products')
        .update({
          stock_quantity: originalProduct.stock_quantity + originalOrderItem.quantity,
        })
        .eq('id', originalOrderItem.product_id);
    }

    // Decrement stock for the new product
    if (newProduct.stock_quantity !== UNLIMITED_STOCK) {
      const { data: currentProduct, error } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', newProduct.id)
        .single();

      if (error || !currentProduct) {
        throw new Error('Could not fetch product for stock update.');
      }

      await supabase
        .from('products')
        .update({
          stock_quantity:
            currentProduct.stock_quantity -
            (updatedOrderItem.quantity ?? originalOrderItem.quantity),
        })
        .eq('id', newProduct.id);
    }
  };

  const createOrderItemUpdate = (
    updatedOrderItem: Partial<OrderItem>,
    unitPrice: number,
    lineTotal: number
  ): OrderItemUpdate => {
    return {
      ...updatedOrderItem,
      unit_price: unitPrice,
      line_total: lineTotal,
    };
  };

  // Handle edit using the shared hook
  const handleEdit = async (updatedOrderItem: Partial<OrderItem>): Promise<void> => {
    try {
      if (!updatedOrderItem.product_id) {
        throw new Error('Παρακαλώ επιλέξτε προϊόν');
      }

      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', updatedOrderItem.product_id)
        .single();

      if (productError) {
        throw new Error(`Σφάλμα ανάκτησης προϊόντος: ${productError.message}`);
      }

      if (!newProduct) {
        throw new Error(SALES_MESSAGES.CODE_NOT_FOUND);
      }

      validateUpdate(updatedOrderItem, newProduct as Product);
      const { unitPrice, lineTotal } = calculatePrices(updatedOrderItem, newProduct as Product);

      await updateStock(
        currentOrderItem,
        updatedOrderItem,
        newProduct as Product,
        (currentOrderItem as OrderItem & { product?: Product }).product
      );

      const orderItemUpdate = createOrderItemUpdate(updatedOrderItem, unitPrice, lineTotal);

      await editOrderItem(currentOrderItem.id, orderItemUpdate);
      const updatedItem = { ...currentOrderItem, ...orderItemUpdate };
      setCurrentOrderItem(updatedItem);
      onUpdate(updatedItem);
      setIsEditing(false);
      setError(null);
      toast.success('Η πώληση ενημερώθηκε επιτυχώς');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : SALES_MESSAGES.UPDATE_ERROR;
      setError(message);
      toast.error(message);
    }
  };

  // Handle delete using the shared hook
  const handleDelete = async () => {
    if (!canEdit) {
      toast.error(SALES_MESSAGES.EDIT_WINDOW_EXPIRED);
      return;
    }

    const success = await deleteOrderItem(orderItem.id);
    if (success) {
      setIsDeleted(true);
    }
  };

  return (
    <>
      <SaleCard
        canEdit={canEdit}
        isDeleted={isDeleted ?? false}
        isEdited={currentOrderItem.is_edited}
        isLoading={isLoading}
        onDelete={handleDelete}
        onEdit={() => setIsEditing(true)}
        orderItem={currentOrderItem}
      />
      <EditDialog
        onOpenChange={setIsEditing}
        onSave={handleEdit}
        open={isEditing}
        orderItem={currentOrderItem}
      />
    </>
  );
}

type SaleCardProps = {
  isDeleted: boolean;
  isEdited: boolean;
  onDelete: () => void;
  onEdit: () => void;
  orderItem: OrderItem & { product: Product };
  canEdit: boolean;
  isLoading: boolean;
};

function SaleCard({
  isDeleted,
  isEdited,
  onDelete,
  onEdit,
  orderItem,
  canEdit,
  isLoading,
}: SaleCardProps) {
  const [currentOrderItem, setCurrentOrderItem] = useState(orderItem);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const { created_at, product, quantity, is_treat } = currentOrderItem;

  useEffect(() => {
    setCurrentOrderItem(orderItem);
  }, [orderItem]);

  if (isDeleted) {
    return null;
  }

  return (
    <>
      <div
        className={cn(
          'relative flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm transition-all',
          isDeleted && 'opacity-50'
        )}
      >
        <div className="flex items-center p-4">
          <ProductImage
            alt={product.name}
            src={product.image_url ?? 'https://via.placeholder.com/150'}
          />
          <div className="ml-4 flex-1 space-y-1">
            <p className="font-semibold">{product.name}</p>
            <p className="text-muted-foreground text-sm">
              {formatDateWithGreekAmPm(new Date(created_at))}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span>{quantity}x</span>
              {is_treat ? (
                <Badge className="text-xs" variant="secondary">
                  Κέρασμα
                </Badge>
              ) : (
                <Badge className="text-xs" variant="outline">
                  {PAYMENT_METHOD_LABELS.cash}
                </Badge>
              )}
              {isEdited && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge className="text-xs" variant="secondary">
                        Edited
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Original: {currentOrderItem.original_quantity || quantity}x{' '}
                        {currentOrderItem.original_code || product.name}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canEdit && (
              <>
                <button
                  aria-label="Επεξεργασία πώλησης"
                  className="rounded p-1 transition-colors hover:bg-muted"
                  disabled={isLoading}
                  onClick={onEdit}
                  type="button"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  aria-label="Διαγραφή πώλησης"
                  className="rounded p-1 transition-colors hover:bg-muted"
                  disabled={isLoading}
                  onClick={() => setShowDeleteConfirmation(true)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </button>
              </>
            )}
            <p className="font-semibold">
              {is_treat ? (
                <span className="text-amber-500">Δωρεάν</span>
              ) : (
                `${currentOrderItem.line_total?.toFixed(2) || '0.00'}€`
              )}
            </p>
          </div>
        </div>
      </div>
      <ConfirmationDialog
        description="Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την πώληση;"
        onConfirm={onDelete}
        onOpenChange={setShowDeleteConfirmation}
        open={showDeleteConfirmation}
        title="Διαγραφή Πώλησης"
      />
    </>
  );
}
