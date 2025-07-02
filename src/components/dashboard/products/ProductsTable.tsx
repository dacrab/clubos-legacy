"use client";

import { useState, useMemo, useRef, useEffect, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { useVirtualizer } from '@tanstack/react-virtual';
import { toast } from "sonner";
import { Trash2, Edit2, PackageX } from "lucide-react";
import useSWR from 'swr';
import { useMediaQuery } from "@/hooks/utils/useMediaQuery";
import { createClientSupabase } from '@/lib/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader as UiTableHeader, TableRow as UiTableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AddProductButton from "./AddProductButton";
import ManageCategoriesButton from "./ManageCategoriesButton";
import { ProductImage } from "@/components/ui/product-image";
import { StockStatusBadge } from "@/components/ui/stock-status-badge";
import { SortButton } from "@/components/ui/sort-button";
import { formatPrice } from "@/lib/utils";

// Database and types
import type { Category } from "@/types/products";

type Product = import('@/types/products').Product & {
  category: (import('@/types/products').Category & {
    parent: Pick<import('@/types/products').Category, 'id' | 'name' | 'description'> | null
  }) | null
};

// UI Components
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { CodeImage } from "@/components/ui/code-image";
import { EmptyState } from "@/components/ui/empty-state";
import { VirtualizedMobileList } from "@/components/ui/virtualized-mobile-list";

// Local components
import ProductFormDialog from "./ProductFormDialog";

// Utils and constants
import { deleteProduct } from "@/app/actions/deleteProduct";
import { cn } from "@/lib/utils";
import { 
  UNLIMITED_STOCK,
  PRODUCT_MESSAGES,
  STOCK_MESSAGES,
  LOW_STOCK_THRESHOLD,
  API_ERROR_MESSAGES
} from "@/lib/constants";

interface ProductsTableProps {
  products: Product[];
  isAdmin: boolean;
}

type SortField = 'name' | 'category' | 'price' | 'stock';
type SortOrder = 'asc' | 'desc';

interface TableRowProps {
  product: Product;
  isAdmin: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

// Helper Functions
const getStockStatus = (stock: number) => {
  if (stock === UNLIMITED_STOCK) {
    return { text: 'Απεριόριστο', className: 'bg-green-100 text-green-800 ring-green-600/20' };
  }
  if (stock === 0) {
    return { text: 'Εξαντλημένο', className: 'bg-red-100 text-red-800 ring-red-600/20' };
  }
  if (stock < LOW_STOCK_THRESHOLD) {
    return { text: `Χαμηλό (${stock})`, className: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20' };
  }
  return { text: 'Σε απόθεμα', className: 'bg-blue-100 text-blue-800 ring-blue-600/20' };
};

const hasUnlimitedStock = (product: Product) => product.stock === UNLIMITED_STOCK;

const formatCategoryPath = (product: Product) => {
  if (!product.category) return '';
  return product.category.parent?.name 
    ? `${product.category.parent.name} / ${product.category.name}`
    : product.category.name;
};

// Components
const TableHeader = memo(({ label, sortField, currentSortField, sortOrder, onSort }: { label: string; sortField: SortField; currentSortField: SortField; sortOrder: SortOrder; onSort: (field: SortField) => void; }) => {
  const isActive = currentSortField === sortField;
  return (
    <button onClick={() => onSort(sortField)} className={cn("flex items-center text-base font-medium hover:text-primary transition-colors", isActive ? "text-primary" : "text-muted-foreground")}>
      {label}
      <svg xmlns="http://www.w3.org/2000/svg" className={cn("ml-1 h-4 w-4 transition-transform", isActive && sortOrder === 'desc' && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  );
});
TableHeader.displayName = 'TableHeader';

const TableRow = memo<TableRowProps>(({ product, isAdmin, onEdit, onDelete }) => (
  <div className="flex items-center px-8 py-4 h-full">
    <div className="w-[40%] flex items-center gap-4">
      <div className="w-8 h-8 shrink-0 flex items-center justify-center">
        <CodeImage imageUrl={product.image_url} code={product.name} />
      </div>
      <span className="text-base font-medium truncate">{product.name}</span>
    </div>
    <div className="w-[25%]"><span className="text-base text-muted-foreground truncate">{formatCategoryPath(product)}</span></div>
    <div className="w-[15%]"><span className="text-base tabular-nums">{product.price.toFixed(2)}€</span></div>
    <div className="w-[12%]"><StockStatusBadge status={getStockStatus(product.stock)} /></div>
    {isAdmin && (
      <div className="w-[8%] min-w-[100px] flex items-center justify-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(product)} className="h-8 w-8"><Edit2 className="h-4 w-4" /><span className="sr-only">Edit</span></Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(product)} className="h-8 w-8 hover:text-destructive"><Trash2 className="h-4 w-4" /><span className="sr-only">Delete</span></Button>
      </div>
    )}
  </div>
));
TableRow.displayName = 'TableRow';

const MobileRow = memo<TableRowProps>(({ product, isAdmin, onEdit, onDelete }) => (
  <div className="bg-card border-b p-3 space-y-2">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <CodeImage imageUrl={product.image_url} code={product.name} />
        <div>
          <h3 className="font-medium text-base">{product.name}</h3>
          <p className="text-sm text-muted-foreground truncate max-w-[200px]">{formatCategoryPath(product)}</p>
        </div>
      </div>
      {isAdmin && (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(product)} className="h-8 w-8"><Edit2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(product)} className="h-8 w-8 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
    <div className="flex items-center justify-between gap-4">
      <div className="text-base font-medium">{product.price.toFixed(2)}€</div>
      <StockStatusBadge status={getStockStatus(product.stock)} size="sm" />
    </div>
  </div>
));
MobileRow.displayName = 'MobileRow';

// Main Component
export default function ProductsTable({ products: initialProducts, isAdmin }: ProductsTableProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const parentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClientSupabase();

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`*, category:categories(*, parent:categories(*))`)
      .order('name')
      .returns<Product[]>();
    if (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
    return data || [];
  }, [supabase]);

  const { data: swrProducts } = useSWR('products', fetchProducts, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  useEffect(() => {
    if (swrProducts) {
      setProducts(swrProducts);
    }
  }, [swrProducts]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSort = useCallback((field: SortField) => {
    setSortOrder(current => sortField === field ? (current === 'asc' ? 'desc' : 'asc') : 'asc');
    setSortField(field);
  }, [sortField]);

  const handleDelete = useCallback(async () => {
    if (!productToDelete) return;
    setLoading(true);
    try {
      await deleteProduct(productToDelete.id);
      toast.success(PRODUCT_MESSAGES.DELETE_SUCCESS);
      router.refresh();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
      setProductToDelete(null);
    }
  }, [productToDelete, router]);

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const fieldA = a[sortField];
      const fieldB = b[sortField];
      
      if (fieldA === null || fieldA === undefined) return 1;
      if (fieldB === null || fieldB === undefined) return -1;

      let comparison = 0;
      if (sortField === 'category') {
        const categoryA = formatCategoryPath(a);
        const categoryB = formatCategoryPath(b);
        comparison = categoryA.localeCompare(categoryB);
      } else if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        comparison = fieldA.localeCompare(fieldB);
      } else {
        if (fieldA > fieldB) comparison = 1;
        else if (fieldA < fieldB) comparison = -1;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [products, sortField, sortOrder]);

  const rowVirtualizer = useVirtualizer({
    count: sortedProducts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  if (products.length === 0) {
    return <EmptyState icon={PackageX} title="Δεν υπάρχουν προϊόντα" description="Δεν υπάρχουν καταχωρημένα προϊόντα στο σύστημα." />;
  }

  if (isMobile) {
    return (
      <>
        <VirtualizedMobileList<Product>
          items={sortedProducts}
          className="h-[calc(100vh-180px)] bg-background"
          estimateSize={() => 110}
          renderItem={(product) => <MobileRow key={product.id} product={product} isAdmin={isAdmin} onEdit={setEditingProduct} onDelete={setProductToDelete} />}
        />
        {editingProduct && <ProductFormDialog product={editingProduct} open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)} />}
        <ConfirmationDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)} title="Διαγραφή Προϊόντος" description={PRODUCT_MESSAGES.DELETE_CONFIRM} onConfirm={handleDelete} loading={loading} />
      </>
    );
  }

  return (
    <>
      <div className="rounded-md border bg-card">
        <div className="flex items-center px-8 py-4 border-b">
          <div className="w-[40%]"><TableHeader label="Προϊόν" sortField="name" currentSortField={sortField} sortOrder={sortOrder} onSort={handleSort} /></div>
          <div className="w-[25%]"><TableHeader label="Κατηγορία" sortField="category" currentSortField={sortField} sortOrder={sortOrder} onSort={handleSort} /></div>
          <div className="w-[15%]"><TableHeader label="Τιμή" sortField="price" currentSortField={sortField} sortOrder={sortOrder} onSort={handleSort} /></div>
          <div className="w-[12%]"><TableHeader label="Απόθεμα" sortField="stock" currentSortField={sortField} sortOrder={sortOrder} onSort={handleSort} /></div>
          {isAdmin && <div className="w-[8%] min-w-[100px]" />}
        </div>
        <div ref={parentRef} className="relative overflow-auto" style={{ height: `calc(100vh - 300px)` }}>
          <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const product = sortedProducts[virtualRow.index];
              return (
                <div key={virtualRow.key} data-index={virtualRow.index} ref={rowVirtualizer.measureElement} className={cn("absolute top-0 left-0 w-full border-b", virtualRow.index === sortedProducts.length - 1 && "border-b-0")} style={{ transform: `translateY(${virtualRow.start}px)` }}>
                  <UiTableRow>
                    <TableRow product={product} isAdmin={isAdmin} onEdit={setEditingProduct} onDelete={setProductToDelete} />
                  </UiTableRow>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {editingProduct && <ProductFormDialog product={editingProduct} open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)} />}
      <ConfirmationDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)} title="Διαγραφή Προϊόντος" description={PRODUCT_MESSAGES.DELETE_CONFIRM} onConfirm={handleDelete} loading={loading} />
    </>
  );
} 