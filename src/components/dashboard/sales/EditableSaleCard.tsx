"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatPrice } from "@/lib/utils";
import { SaleWithDetails, Product } from "@/types/sales";
import { createClientSupabase } from "@/lib/supabase/client";
import { useSaleActions } from '@/hooks/features/sales/useSaleActions';
import { Gift, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Constants
const EDIT_WINDOW_MINUTES = 5;

// Custom type for the editable sale card's state
type EditableSaleState = SaleWithDetails & {
  original_product_name?: string | null;
  original_quantity?: number | null;
};

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
    return <Badge variant="destructive">Διαγράφηκε</Badge>;
  }
  if (isTreat) {
    return (
      <Badge variant="default" className="bg-amber-500 flex items-center gap-1">
        <Gift className="h-3 w-3" />
        <span>Κέρασμα</span>
      </Badge>
    );
  }
  if (isEdited) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="secondary">Επεξεργασμένο</Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Αρχικό: {originalProductCode} (x{originalQuantity})</p>
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
  const [selectedProductId, setSelectedProductId] = useState(sale.product_id);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTreat, setIsTreat] = useState(sale.is_treat);
  const supabase = createClientSupabase();

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      const { data, error } = await supabase.from('products').select('*, category:categories(*)').order('name');
      if (data) {
        setAvailableProducts(data as Product[]);
        setSelectedProduct(data.find(p => p.id === selectedProductId) || null);
      }
      setIsLoading(false);
    }
    fetchProducts();
  }, [selectedProductId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    await onSave({
      ...sale,
      quantity,
      product_id: selectedProduct.id,
      total_price: selectedProduct.price * quantity,
      unit_price: selectedProduct.price,
      is_treat: isTreat,
      product: selectedProduct,
    });
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select onValueChange={setSelectedProductId} defaultValue={selectedProductId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {availableProducts.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value))} />
          <Checkbox checked={isTreat} onCheckedChange={c => setIsTreat(Boolean(c))} />
          <Button type="submit">Αποθήκευση</Button>
          <Button variant="ghost" onClick={onCancel}>Ακύρωση</Button>
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
  const [currentSale, setCurrentSale] = useState<EditableSaleState>(sale);
  const [canEdit, setCanEdit] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  
  const router = useRouter();
  const { isLoading, deleteSale, editSale } = useSaleActions({ onSuccess: () => router.refresh() });

  useEffect(() => {
    const interval = setInterval(() => {
      const diffInMinutes = (new Date().getTime() - new Date(currentSale.created_at).getTime()) / 60000;
      if (diffInMinutes < EDIT_WINDOW_MINUTES) {
        setCanEdit(true);
        const remainingMinutes = Math.floor(EDIT_WINDOW_MINUTES - diffInMinutes);
        const remainingSeconds = Math.floor(((EDIT_WINDOW_MINUTES - diffInMinutes) * 60) % 60);
        setTimeLeft(`${remainingMinutes}:${remainingSeconds.toString().padStart(2, '0')}`);
      } else {
        setCanEdit(false);
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentSale.created_at]);

  const handleDelete = async () => {
    await deleteSale(currentSale.id);
  };

  const handleEdit = async (updatedSale: Partial<SaleWithDetails>) => {
    if (!updatedSale.product_id || !updatedSale.quantity || !updatedSale.unit_price || typeof updatedSale.total_price !== 'number') return;
    
    const success = await editSale(currentSale.id, currentSale, {
      product_id: updatedSale.product_id,
      quantity: updatedSale.quantity,
      unit_price: updatedSale.unit_price,
      total_price: updatedSale.total_price,
      is_treat: updatedSale.is_treat
    });

    if (success) {
      setIsEditing(false);
      // The parent component will receive the refreshed data
    }
  };

  if (currentSale.is_deleted) {
    return null;
  }

  return (
    <div className="p-2 border-b">
      {isEditing ? (
        <EditSaleForm sale={currentSale} onSave={handleEdit} onCancel={() => setIsEditing(false)} />
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div>
            <p>{currentSale.product.name} x{currentSale.quantity} - {formatPrice(currentSale.total_price)}</p>
            <SaleStatusBadge 
              isDeleted={currentSale.is_deleted} 
              isTreat={currentSale.is_treat}
              isEdited={currentSale.is_edited}
              originalProductCode={currentSale.original_product_name || undefined}
              originalQuantity={currentSale.original_quantity || undefined}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsEditing(true)}
              disabled={!canEdit || isLoading || currentSale.is_deleted}
              title={
                currentSale.is_deleted
                  ? 'Το προϊόν έχει διαγραφεί'
                  : canEdit
                  ? `Επεξεργασία (${timeLeft} απομένουν)`
                  : 'Ο χρόνος για επεξεργασία έχει λήξει'
              }
            >
              <Pencil className="w-4 h-4" />
              <span className="sr-only">Επεξεργασία</span>
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              disabled={!canEdit || isLoading || currentSale.is_deleted}
              title={
                currentSale.is_deleted
                  ? 'Το προϊόν έχει διαγραφεί'
                  : canEdit
                  ? 'Διαγραφή'
                  : 'Ο χρόνος για διαγραφή έχει λήξει'
              }
            >
              <Trash2 className="w-4 h-4" />
              <span className="sr-only">Διαγραφή</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}