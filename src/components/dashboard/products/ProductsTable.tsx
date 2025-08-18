'use client';

import { useEffect, useState } from 'react';
import { Package, Search } from 'lucide-react';
import { toast } from 'sonner';

import type { ProductWithCategory } from '@/types/products';
import { logger } from '@/lib/utils/logger';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Input } from '@/components/ui/input';

import ProductFormDialog from './ProductFormDialog';

interface ProductsTableProps {
  searchQuery?: string;
}

export default function ProductsTable({ searchQuery }: ProductsTableProps) {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null);
  const [productToDelete, setProductToDelete] = useState<ProductWithCategory | null>(null);

  // No mobile-specific behavior here; removed unused responsive state

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        logger.error('Error fetching products:', error);
        toast.error('Αποτυχία φόρτωσης προϊόντων');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!productToDelete) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete product');
      }

      toast.success('Το προϊόν διαγράφηκε επιτυχώς');
      setProductToDelete(null);

      // Refresh products list
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
    } catch (error) {
      logger.error('Error deleting product:', error);
      toast.error(error instanceof Error ? error.message : 'Αποτυχία διαγραφής προϊόντος');
    }
  };

  const filteredProducts = products.filter(
    product =>
      product.name.toLowerCase().includes((searchQuery || searchTerm).toLowerCase()) ||
      product.description?.toLowerCase().includes((searchQuery || searchTerm).toLowerCase()) ||
      product.barcode?.toLowerCase().includes((searchQuery || searchTerm).toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-muted h-4 w-full animate-pulse rounded"></div>
        <div className="bg-muted h-4 w-3/4 animate-pulse rounded"></div>
        <div className="bg-muted h-4 w-1/2 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          placeholder="Αναζήτηση προϊόντων..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products display */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Δεν βρέθηκαν προϊόντα"
          description="Δεν υπάρχουν προϊόντα που να ταιριάζουν με τα κριτήρια αναζήτησης."
        />
      ) : (
        <div className="text-muted-foreground py-8 text-center">
          Δεν υπάρχουν διαθέσιμα προϊόντα
        </div>
      )}

      {/* Edit Dialog */}
      {editingProduct && (
        <ProductFormDialog
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={open => !open && setEditingProduct(null)}
          onProductSaved={() => {
            setEditingProduct(null);
            // Refresh products list
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={!!productToDelete}
        onOpenChange={open => !open && setProductToDelete(null)}
        title="Διαγραφή Προϊόντος"
        description={`Είστε σίγουροι ότι θέλετε να διαγράψετε το προϊόν "${productToDelete?.name}"; Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.`}
        onConfirm={handleDelete}
      />
    </div>
  );
}
