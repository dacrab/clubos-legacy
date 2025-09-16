'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { Edit2, PackageX, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { CodeImage } from '@/components/ui/code-image';
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
import { StockStatusBadge } from '@/components/ui/stock-status-badge';
import { VirtualizedMobileList } from '@/components/ui/virtualized-mobile-list';
import { usePolling } from '@/hooks/use-polling';
// Database and types
import {
  API_ERROR_MESSAGES,
  BUTTON_LABELS,
  CODE_MESSAGES,
  LOW_STOCK_THRESHOLD,
  STOCK_MESSAGES,
  UNLIMITED_STOCK,
} from '@/lib/constants';
import { createClientSupabase } from '@/lib/supabase';
import { cn } from '@/lib/utils/format';
import { fetchProductsForUI } from '@/lib/utils/products';
import type { ProductWithCategory } from '@/types/database';

// UI Components

// Local components
import EditCodeDialog from './edit-code-dialog';

// Utils and constants

// Types
type Code = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url: string | null;
  category?: {
    id: string;
    name: string;
    description: string | null;
    parent_id: string | null;
    is_active: boolean;
    created_at: string;
    created_by: string;
    parent?: {
      id: string;
      name: string;
      description: string | null;
      parent_id: string | null;
      is_active: boolean;
      created_at: string;
      created_by: string;
    } | null;
  } | null;
};

type CodesTableProps = {
  codes: Code[];
  isAdmin: boolean;
};

type SortField = 'name' | 'category' | 'price' | 'stock';
type SortOrder = 'asc' | 'desc';

type TableRowProps = {
  code: Code;
  isAdmin: boolean;
  onEdit: (code: Code) => void;
  onDelete: (code: Code) => void;
};

// Constants
const MOBILE_BREAKPOINT = 768;
const DESKTOP_ROW_ESTIMATE = 72;
const MOBILE_ROW_ESTIMATE = 110;

// Helper Functions
const hasUnlimitedStock = (code: Code) => code.stock === UNLIMITED_STOCK;

const formatCategoryPath = (code: Code) => {
  if (!code.category) {
    return '';
  }
  return code.category.parent?.name
    ? `${code.category.parent.name}/${code.category.name}`
    : code.category.name;
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

const TableRow = memo<TableRowProps>(({ code, isAdmin, onEdit, onDelete }) => (
  <div className="flex h-full items-center px-8 py-4">
    <div className="flex w-[40%] items-center gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center">
        <CodeImage code={code.name} imageUrl={code.image_url} />
      </div>
      <span className="truncate font-medium text-base">{code.name}</span>
    </div>
    <div className="w-[25%]">
      <span className="truncate text-base text-muted-foreground">{formatCategoryPath(code)}</span>
    </div>
    <div className="w-[15%]">
      <span className="text-base tabular-nums">{code.price.toFixed(2)}€</span>
    </div>
    <div className="w-[12%]">
      <StockStatusBadge
        status={{
          text: hasUnlimitedStock(code)
            ? STOCK_MESSAGES.UNLIMITED_STOCK_LABEL
            : `${code.stock} τεμ.`,
          className: getStockStatusStyle(code.stock),
        }}
      />
    </div>
    {isAdmin && (
      <div className="flex w-[8%] min-w-[100px] items-center justify-center gap-2">
        <Button className="h-8 w-8" onClick={() => onEdit(code)} size="icon" variant="ghost">
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          className="h-8 w-8 hover:text-destructive"
          onClick={() => onDelete(code)}
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

const MobileRow = memo<TableRowProps>(({ code, isAdmin, onEdit, onDelete }) => (
  <div className="space-y-2 border-b bg-card p-3">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <CodeImage code={code.name} imageUrl={code.image_url} />
        <div>
          <h3 className="font-medium text-base">{code.name}</h3>
          <p className="max-w-[200px] truncate text-muted-foreground text-sm">
            {formatCategoryPath(code)}
          </p>
        </div>
      </div>
      {isAdmin && (
        <div className="flex gap-1">
          <Button className="h-8 w-8" onClick={() => onEdit(code)} size="icon" variant="ghost">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            className="h-8 w-8 hover:text-destructive"
            onClick={() => onDelete(code)}
            size="icon"
            variant="ghost"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
    <div className="flex items-center justify-between gap-4">
      <div className="font-medium text-base">{code.price.toFixed(2)}€</div>
      <StockStatusBadge
        size="sm"
        status={{
          text: hasUnlimitedStock(code)
            ? STOCK_MESSAGES.UNLIMITED_STOCK_LABEL
            : `${code.stock} τεμ.`,
          className: getStockStatusStyle(code.stock),
        }}
      />
    </div>
  </div>
));

MobileRow.displayName = 'MobileRow';

// Main Component
export default function CodesTable({ codes: initialCodes, isAdmin }: CodesTableProps) {
  // State
  const [codes, setCodes] = useState<Code[]>(initialCodes);
  type EditingCode = Code & { category_id: string | null };
  const [editingCode, setEditingCode] = useState<EditingCode | null>(null);
  const [_managingStock, _setManagingStock] = useState<Code | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<Code | null>(null);
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
  const fetchCodes = useCallback(async () => {
    try {
      const data = await fetchProductsForUI(
        supabase as unknown as Parameters<typeof fetchProductsForUI>[0],
        { isAdmin }
      );
      const mapped: Code[] = (data || []).map((p: ProductWithCategory) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock_quantity,
        image_url: p.image_url ?? null,
        category: p.category ?? null,
      }));
      setCodes(mapped);
    } catch (_error) {
      // Handle error silently
    }
  }, [supabase, isAdmin]);

  // Use polling hook to fetch codes every 5 seconds
  usePolling({
    onPoll: fetchCodes,
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
    if (!codeToDelete) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', codeToDelete.id);

      if (error) {
        throw error;
      }

      toast.success(CODE_MESSAGES.DELETE_SUCCESS);
      router.refresh();
    } catch (_error) {
      toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setCodeToDelete(null);
    }
  }, [codeToDelete, router, supabase]);

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

  const sortedCodes = useMemo(() => {
    const getValue = (code: Code, field: SortField) => {
      if (field === 'name') {
        return code.name.toLowerCase();
      }
      if (field === 'category') {
        return formatCategoryPath(code).toLowerCase();
      }
      if (field === 'price') {
        return code.price;
      }
      if (field === 'stock') {
        return code.stock;
      }
      return '';
    };

    return [...codes].sort((a, b) => {
      const aValue = getValue(a, sortField);
      const bValue = getValue(b, sortField);

      return sortOrder === 'asc' ? compareValues(aValue, bValue) : compareValues(bValue, aValue);
    });
  }, [codes, sortField, sortOrder, compareValues]);

  // Virtualization
  const rowVirtualizer = useVirtualizer({
    count: sortedCodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => DESKTOP_ROW_ESTIMATE,
    overscan: 10,
    measureElement: (element) => element.getBoundingClientRect().height,
  });

  // Empty state
  if (codes.length === 0) {
    return (
      <EmptyState
        description="Δεν υπάρχουν καταχωρημένοι κωδικοί στο σύστημα."
        icon={PackageX}
        title="Δεν υπάρχουν κωδικοί"
      />
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <>
        <VirtualizedMobileList<Code>
          className="h-[calc(100vh-180px)] bg-background"
          estimateSize={() => MOBILE_ROW_ESTIMATE}
          items={sortedCodes}
          renderItem={(item) => (
            <MobileRow
              code={item}
              isAdmin={isAdmin}
              key={item.id}
              onDelete={(deletedCode) => {
                setCodeToDelete(deletedCode);
                setDeleteDialogOpen(true);
              }}
              onEdit={(code) =>
                setEditingCode({
                  ...code,
                  category_id: code.category?.id ?? null,
                })
              }
            />
          )}
        />
        {editingCode && <EditCodeDialog code={editingCode} onClose={() => setEditingCode(null)} />}
        {deleteDialogOpen && codeToDelete && (
          <Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Διαγραφή Κωδικού</DialogTitle>
                <DialogDescription>{CODE_MESSAGES.DELETE_CONFIRM}</DialogDescription>
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
              label="Κωδικός"
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
              const item = sortedCodes[virtualRow.index];
              if (!item) {
                return null;
              }
              return (
                <div
                  className={cn(
                    'absolute top-0 left-0 w-full border-b',
                    virtualRow.index === sortedCodes.length - 1 && 'border-b-0'
                  )}
                  data-index={virtualRow.index}
                  key={virtualRow.key}
                  ref={rowVirtualizer.measureElement}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <TableRow
                    code={item}
                    isAdmin={isAdmin}
                    onDelete={(deletedCode) => {
                      setCodeToDelete(deletedCode);
                      setDeleteDialogOpen(true);
                    }}
                    onEdit={(code) =>
                      setEditingCode({
                        ...code,
                        category_id: code.category?.id ?? null,
                      })
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {editingCode && <EditCodeDialog code={editingCode} onClose={() => setEditingCode(null)} />}

      {deleteDialogOpen && codeToDelete && (
        <Dialog onOpenChange={setDeleteDialogOpen} open={deleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Διαγραφή Κωδικού</DialogTitle>
              <DialogDescription>{CODE_MESSAGES.DELETE_CONFIRM}</DialogDescription>
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
