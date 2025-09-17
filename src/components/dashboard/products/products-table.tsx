'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { Edit2, PackageX, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingButton } from '@/components/ui/loading-button';
import { ProductAvatar } from '@/components/ui/product-avatar';
import { StockStatusBadge } from '@/components/ui/stock-status-badge';
import { VirtualizedMobileList } from '@/components/ui/virtualized-mobile-list';
import { usePolling } from '@/hooks/utils/use-polling';
// Database and types
import {
  API_ERROR_MESSAGES,
  BUTTON_LABELS,
  LOW_STOCK_THRESHOLD,
  PRODUCT_MESSAGES,
  STOCK_MESSAGES,
  UNLIMITED_STOCK,
} from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/format';
import { fetchProductsForUI } from '@/lib/utils/products';
import { toast } from '@/lib/utils/toast';
import type { Category, ProductWithCategory } from '@/types/database';

// UI Components

// Local components
import EditProductDialog from './edit-product-dialog';

// Utils and constants

// Types
type ProductsTableProps = {
  products: ProductWithCategory[];
  isAdmin: boolean;
};

type SortField = 'name' | 'category' | 'price' | 'stock';
type SortOrder = 'asc' | 'desc';

type TableRowProps = {
  product: ProductWithCategory;
  isAdmin: boolean;
  onEdit: (product: ProductWithCategory) => void;
  onDelete: (product: ProductWithCategory) => void;
};

// Constants
const MOBILE_BREAKPOINT = 768;
const DESKTOP_ROW_ESTIMATE = 72;
const MOBILE_ROW_ESTIMATE = 110;

// Helper Functions
const hasUnlimitedStock = (product: ProductWithCategory) =>
  product.stock_quantity === UNLIMITED_STOCK;

const formatCategoryPath = (product: ProductWithCategory) => {
  if (!product.category) {
    return '';
  }
  const category = product.category as Category & { parent?: Category };
  return category.parent?.name ? `${category.parent.name}/${category.name}` : category.name;
};

const getStockStatusStyle = (stock: number) => {
  if (stock === UNLIMITED_STOCK) {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
  }
  if (stock >= LOW_STOCK_THRESHOLD) {
    return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400';
  }
  if (stock > 0) {
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400';
  }
  return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
};

// Components
const TableHeader = memo(
  ({
    label,
    sortField: field,
    currentSortField,
    sortOrder,
    onSort,
  }: {
    label: string;
    sortField: SortField;
    currentSortField: SortField;
    sortOrder: SortOrder;
    onSort: (field: SortField) => void;
  }) => {
    const isActive = currentSortField === field;

    return (
      <button
        className={cn(
          'flex items-center font-medium text-base transition-colors hover:text-primary',
          isActive ? 'text-primary' : 'text-muted-foreground'
        )}
        onClick={() => onSort(field)}
        type="button"
      >
        {label}
        <svg
          className={cn(
            'ml-1 h-4 w-4 transition-transform',
            isActive && sortOrder === 'desc' && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Sort Icon</title>
          <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      </button>
    );
  }
);

TableHeader.displayName = 'TableHeader';

const TableRow = memo<TableRowProps>(({ product, isAdmin, onEdit, onDelete }) => (
  <div className="flex h-full items-center px-8 py-4">
    <div className="flex w-[40%] items-center gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
        <ProductAvatar imageUrl={product.image_url} productName={product.name} />
      </div>
      <span className="truncate font-medium text-base">{product.name}</span>
    </div>
    <div className="w-[25%]">
      <span className="truncate text-base text-muted-foreground">
        {formatCategoryPath(product)}
      </span>
    </div>
    <div className="w-[15%]">
      <span className="text-base tabular-nums">{product.price.toFixed(2)}€</span>
    </div>
    <div className="w-[12%]">
      <StockStatusBadge
        status={{
          text: hasUnlimitedStock(product)
            ? STOCK_MESSAGES.UNLIMITED_STOCK_LABEL
            : `${product.stock_quantity} τεμ.`,
          className: getStockStatusStyle(product.stock_quantity),
        }}
      />
    </div>
    {isAdmin && (
      <div className="flex w-[8%] min-w-[100px] items-center justify-center gap-2">
        <Button className="h-8 w-8" onClick={() => onEdit(product)} size="icon" variant="ghost">
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          className="h-8 w-8 hover:text-destructive"
          onClick={() => onDelete(product)}
          size="icon"
          variant="ghost"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    )}
  </div>
));

TableRow.displayName = 'TableRow';

const MobileRow = memo<TableRowProps>(({ product, isAdmin, onEdit, onDelete }) => (
  <div className="space-y-2 border-b bg-card p-3">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <ProductAvatar imageUrl={product.image_url} productName={product.name} />
        <div>
          <h3 className="font-medium text-base">{product.name}</h3>
          <p className="max-w-[200px] truncate text-muted-foreground text-sm">
            {formatCategoryPath(product)}
          </p>
        </div>
      </div>
      {isAdmin && (
        <div className="flex gap-1">
          <Button className="h-8 w-8" onClick={() => onEdit(product)} size="icon" variant="ghost">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            className="h-8 w-8 hover:text-destructive"
            onClick={() => onDelete(product)}
            size="icon"
            variant="ghost"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
    <div className="flex items-center justify-between gap-4">
      <div className="font-medium text-base">{product.price.toFixed(2)}€</div>
      <StockStatusBadge
        size="sm"
        status={{
          text: hasUnlimitedStock(product)
            ? STOCK_MESSAGES.UNLIMITED_STOCK_LABEL
            : `${product.stock_quantity} τεμ.`,
          className: getStockStatusStyle(product.stock_quantity),
        }}
      />
    </div>
  </div>
));

MobileRow.displayName = 'MobileRow';

// Main Component
export default function ProductsTable({ products: initialProducts, isAdmin }: ProductsTableProps) {
  // State
  const [products, setProducts] = useState<ProductWithCategory[]>(initialProducts);
  type EditingProduct = ProductWithCategory & { category_id: string | null };
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [_managingStock, _setManagingStock] = useState<ProductWithCategory | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ProductWithCategory | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);
  const [_height, setHeight] = useState(0);
  const router = useRouter();
  const supabase = createClientSupabase();

  // Update height on window resize
  useEffect(() => {
    const updateHeight = () => {
      if (parentRef.current) {
        setHeight(parentRef.current.offsetHeight);
      }
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Replace useRealtimeSubscription with usePolling
  const fetchProducts = useCallback(async () => {
    try {
      const data = await fetchProductsForUI(
        supabase as unknown as Parameters<typeof fetchProductsForUI>[0],
        { isAdmin }
      );
      const mapped: ProductWithCategory[] = (data || []).map((p: ProductWithCategory) => ({
        ...p,
        stock: p.stock_quantity,
      }));
      setProducts(mapped);
    } catch (_error) {
      // Handle error silently
    }
  }, [supabase, isAdmin]);

  // Use polling hook to fetch products every 5 seconds
  usePolling({
    onPoll: fetchProducts,
    interval: 5000, // 5 seconds
    enabled: true,
  });

  // Handlers
  const handleSort = useCallback(
    (field: SortField) => {
      setSortOrder((current) =>
        sortField === field ? (current === 'asc' ? 'desc' : 'asc') : 'asc'
      );
      setSortField(field);
    },
    [sortField]
  );

  const handleDelete = useCallback(async () => {
    if (!productToDelete) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);

      if (error) {
        throw error;
      }

      toast.success(PRODUCT_MESSAGES.DELETE_SUCCESS);
      router.refresh();
    } catch (_error) {
      toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  }, [productToDelete, router, supabase]);

  // Sorting
  const compareValues = useCallback((a: string | number, b: string | number) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }, []);

  const sortedProducts = useMemo(() => {
    const getValue = (product: ProductWithCategory, field: SortField) => {
      if (field === 'name') {
        return product.name.toLowerCase();
      }
      if (field === 'category') {
        return formatCategoryPath(product).toLowerCase();
      }
      if (field === 'price') {
        return product.price;
      }
      if (field === 'stock') {
        return product.stock_quantity;
      }
      return '';
    };

    return [...products].sort((a, b) => {
      const aValue = getValue(a, sortField);
      const bValue = getValue(b, sortField);

      return sortOrder === 'asc' ? compareValues(aValue, bValue) : compareValues(bValue, aValue);
    });
  }, [products, sortField, sortOrder, compareValues]);

  // Virtualization
  const rowVirtualizer = useVirtualizer({
    count: sortedProducts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => DESKTOP_ROW_ESTIMATE,
    overscan: 10,
    measureElement: (element) => element.getBoundingClientRect().height,
  });

  // Empty state
  if (products.length === 0) {
    return (
      <EmptyState
        description="Δεν υπάρχουν καταχωρημένα προϊόντα στο σύστημα."
        icon={PackageX}
        title="Δεν υπάρχουν προϊόντα"
      />
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <>
        <VirtualizedMobileList<ProductWithCategory>
          className="h-[calc(100vh-180px)] bg-background"
          estimateSize={() => MOBILE_ROW_ESTIMATE}
          items={sortedProducts}
          renderItem={(item) => (
            <MobileRow
              isAdmin={isAdmin}
              key={item.id}
              onDelete={(deletedProduct) => {
                setProductToDelete(deletedProduct);
                setDeleteDialogOpen(true);
              }}
              onEdit={(product) =>
                setEditingProduct({
                  ...product,
                  category_id: product.category?.id ?? null,
                })
              }
              product={item}
            />
          )}
        />
        {editingProduct && (
          <EditProductDialog onClose={() => setEditingProduct(null)} product={editingProduct} />
        )}
        {deleteDialogOpen && productToDelete && (
          <Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Διαγραφή Προϊόντος</DialogTitle>
                <DialogDescription>{PRODUCT_MESSAGES.DELETE_CONFIRM}</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={() => setDeleteDialogOpen(false)} variant="outline">
                  {BUTTON_LABELS.CANCEL}
                </Button>
                <LoadingButton loading={loading} onClick={handleDelete} variant="destructive">
                  {BUTTON_LABELS.DELETE}
                </LoadingButton>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  // Desktop view
  return (
    <>
      <div className="rounded-md border bg-card">
        <div className="flex items-center border-b px-8 py-4">
          <div className="w-[40%]">
            <TableHeader
              currentSortField={sortField}
              label="Προϊόν"
              onSort={handleSort}
              sortField="name"
              sortOrder={sortOrder}
            />
          </div>
          <div className="w-[25%]">
            <TableHeader
              currentSortField={sortField}
              label="Κατηγορία"
              onSort={handleSort}
              sortField="category"
              sortOrder={sortOrder}
            />
          </div>
          <div className="w-[15%]">
            <TableHeader
              currentSortField={sortField}
              label="Τιμή"
              onSort={handleSort}
              sortField="price"
              sortOrder={sortOrder}
            />
          </div>
          <div className="w-[12%]">
            <TableHeader
              currentSortField={sortField}
              label="Απόθεμα"
              onSort={handleSort}
              sortField="stock"
              sortOrder={sortOrder}
            />
          </div>
          {isAdmin && <div className="w-[8%] min-w-[100px]" />}
        </div>
        <div
          className="relative overflow-auto"
          ref={parentRef}
          style={{ height: 'calc(100vh - 300px)' }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = sortedProducts[virtualRow.index];
              if (!item) {
                return null;
              }
              return (
                <div
                  className={cn(
                    'absolute top-0 left-0 w-full border-b',
                    virtualRow.index === sortedProducts.length - 1 && 'border-b-0'
                  )}
                  data-index={virtualRow.index}
                  key={virtualRow.key}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <TableRow
                    isAdmin={isAdmin}
                    onDelete={(deletedProduct) => {
                      setProductToDelete(deletedProduct);
                      setDeleteDialogOpen(true);
                    }}
                    onEdit={(product) =>
                      setEditingProduct({
                        ...product,
                        category_id: product.category?.id ?? null,
                      })
                    }
                    product={item}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {editingProduct && (
        <EditProductDialog onClose={() => setEditingProduct(null)} product={editingProduct} />
      )}

      {deleteDialogOpen && productToDelete && (
        <Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Διαγραφή Προϊόντος</DialogTitle>
              <DialogDescription>{PRODUCT_MESSAGES.DELETE_CONFIRM}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setDeleteDialogOpen(false)} variant="outline">
                {BUTTON_LABELS.CANCEL}
              </Button>
              <LoadingButton loading={loading} onClick={handleDelete} variant="destructive">
                {BUTTON_LABELS.DELETE}
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
