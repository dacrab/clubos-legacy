"use client";

import { useVirtualizer } from '@tanstack/react-virtual';
import { Trash2, Edit2, PackageX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useRef, useEffect, useCallback, memo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CodeImage } from "@/components/ui/code-image";
import { 
  Dialog,
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingButton } from "@/components/ui/loading-button";
import { StockStatusBadge } from "@/components/ui/stock-status-badge";
import { VirtualizedMobileList } from "@/components/ui/virtualized-mobile-list";
import { usePolling } from "@/hooks/usePolling";
// Database and types
import { 
  UNLIMITED_STOCK,
  CODE_MESSAGES,
  STOCK_MESSAGES,
  LOW_STOCK_THRESHOLD,
  BUTTON_LABELS,
  API_ERROR_MESSAGES
} from "@/lib/constants";
import { createClientSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/supabase";

// UI Components

// Local components
import EditCodeDialog from "./EditCodeDialog";

// Utils and constants

// Types
type Code = Database['public']['Tables']['codes']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'] & {
    parent?: Database['public']['Tables']['categories']['Row'] | null;
  } | null;
};

interface CodesTableProps {
  codes: Code[];
  isAdmin: boolean;
}

type SortField = 'name' | 'category' | 'price' | 'stock';
type SortOrder = 'asc' | 'desc';

interface TableRowProps {
  code: Code;
  isAdmin: boolean;
  onEdit: (code: Code) => void;
  onDelete: (code: Code) => void;
}

// Helper Functions
const hasUnlimitedStock = (code: Code) => code.stock === UNLIMITED_STOCK;

const formatCategoryPath = (code: Code) => {
  if (!code.category) {return '';}
  return code.category.parent?.name 
    ? `${code.category.parent.name}/${code.category.name}`
    : code.category.name;
};

const getStockStatusStyle = (stock: number) => {
  if (stock === UNLIMITED_STOCK) {
    return "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
  }
  if (stock >= LOW_STOCK_THRESHOLD) {
    return "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
  }
  if (stock > 0) {
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400";
  }
  return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400";
};

// Components
const TableHeader = memo(({ 
  label, 
  sortField: field, 
  currentSortField, 
  sortOrder, 
  onSort 
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
      onClick={() => onSort(field)}
      className={cn(
        "flex items-center text-base font-medium hover:text-primary transition-colors",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
    >
      {label}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "ml-1 h-4 w-4 transition-transform",
          isActive && sortOrder === 'desc' && "rotate-180"
        )}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    </button>
  );
});

TableHeader.displayName = 'TableHeader';

const TableRow = memo<TableRowProps>(({ code, isAdmin, onEdit, onDelete }) => (
  <div className="flex items-center px-8 py-4 h-full">
    <div className="w-[40%] flex items-center gap-4">
      <div className="w-8 h-8 shrink-0 flex items-center justify-center">
        <CodeImage imageUrl={code.image_url} code={code.name} />
      </div>
      <span className="text-base font-medium truncate">{code.name}</span>
    </div>
    <div className="w-[25%]">
      <span className="text-base text-muted-foreground truncate">
        {formatCategoryPath(code)}
      </span>
    </div>
    <div className="w-[15%]">
      <span className="text-base tabular-nums">
        {code.price.toFixed(2)}€
      </span>
    </div>
    <div className="w-[12%]">
      <StockStatusBadge 
        status={{
          text: hasUnlimitedStock(code) ? STOCK_MESSAGES.UNLIMITED_STOCK_LABEL : `${code.stock} τεμ.`,
          className: getStockStatusStyle(code.stock)
        }}
      />
    </div>
    {isAdmin && (
      <div className="w-[8%] min-w-[100px] flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(code)}
          className="h-8 w-8"
        >
          <Edit2 className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(code)}
          className="h-8 w-8 hover:text-destructive"
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
  <div className="bg-card border-b p-3 space-y-2">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <CodeImage imageUrl={code.image_url} code={code.name} />
        <div>
          <h3 className="font-medium text-base">{code.name}</h3>
          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
            {formatCategoryPath(code)}
          </p>
        </div>
      </div>
      {isAdmin && (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(code)}
            className="h-8 w-8"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(code)}
            className="h-8 w-8 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
    <div className="flex items-center justify-between gap-4">
      <div className="text-base font-medium">
        {code.price.toFixed(2)}€
      </div>
      <StockStatusBadge 
        status={{
          text: hasUnlimitedStock(code) ? STOCK_MESSAGES.UNLIMITED_STOCK_LABEL : `${code.stock} τεμ.`,
          className: getStockStatusStyle(code.stock)
        }}
        size="sm"
      />
    </div>
  </div>
));

MobileRow.displayName = 'MobileRow';

// Main Component
export default function CodesTable({ codes: initialCodes, isAdmin }: CodesTableProps) {
  // State
  const [codes, setCodes] = useState<Code[]>(initialCodes);
  const [editingCode, setEditingCode] = useState<Code | null>(null);
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
      setIsMobile(window.innerWidth < 768);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Replace useRealtimeSubscription with usePolling
  const fetchCodes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('codes')
        .select(`
          *,
          category:categories!codes_category_id_fkey (
            id,
            name,
            description,
            created_at,
            parent_id,
            parent:categories (
              id,
              name,
              description
            )
          )
        `)
        .order('name');

      if (error) {throw error;}
      setCodes(data);
    } catch (error) {
      console.error('Error fetching codes:', error);
    }
  }, [supabase]);

  // Use polling hook to fetch codes every 5 seconds
  usePolling({
    onPoll: fetchCodes,
    interval: 5000, // 5 seconds
    enabled: true,
  });

  // Handlers
  const handleSort = useCallback((field: SortField) => {
    setSortOrder(current => 
      sortField === field 
        ? current === 'asc' 
          ? 'desc' 
          : 'asc'
        : 'asc'
    );
    setSortField(field);
  }, [sortField]);

  const handleDelete = useCallback(async () => {
    if (!codeToDelete) {return;}

    setLoading(true);
    try {
      const { error } = await supabase
        .from('codes')
        .delete()
        .eq('id', codeToDelete.id);

      if (error) {throw error;}
      
      toast.success(CODE_MESSAGES.DELETE_SUCCESS);
      router.refresh();
    } catch (error) {
      console.error('Error deleting code:', error);
      toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setCodeToDelete(null);
    }
  }, [codeToDelete, router, supabase]);

  // Sorting
  const sortedCodes = useMemo(() => {
    const getValue = (code: Code, field: SortField) => {
      switch (field) {
        case 'name':
          return code.name.toLowerCase();
        case 'category':
          return formatCategoryPath(code).toLowerCase();
        case 'price':
          return code.price;
        case 'stock':
          return code.stock;
        default:
          return '';
      }
    };

    return [...codes].sort((a, b) => {
      const aValue = getValue(a, sortField);
      const bValue = getValue(b, sortField);

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
      }
    });
  }, [codes, sortField, sortOrder]);

  // Virtualization
  const rowVirtualizer = useVirtualizer({
    count: sortedCodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
    measureElement: (element) => element.getBoundingClientRect().height,
  });

  // Empty state
  if (codes.length === 0) {
    return (
      <EmptyState
        icon={PackageX}
        title="Δεν υπάρχουν κωδικοί"
        description="Δεν υπάρχουν καταχωρημένοι κωδικοί στο σύστημα."
      />
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <>
        <VirtualizedMobileList<Code>
          items={sortedCodes}
          className="h-[calc(100vh-180px)] bg-background"
          estimateSize={() => 110}
          renderItem={(code) => (
            <MobileRow
              key={code.id}
              code={code}
              isAdmin={isAdmin}
              onEdit={setEditingCode}
              onDelete={(code) => {
                setCodeToDelete(code);
                setDeleteDialogOpen(true);
              }}
            />
          )}
        />
        {editingCode && (
          <EditCodeDialog
            code={editingCode}
            onClose={() => setEditingCode(null)}
          />
        )}
        {deleteDialogOpen && codeToDelete && (
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Διαγραφή Κωδικού</DialogTitle>
                <DialogDescription>
                  {CODE_MESSAGES.DELETE_CONFIRM}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  {BUTTON_LABELS.CANCEL}
                </Button>
                <LoadingButton
                  variant="destructive"
                  onClick={handleDelete}
                  loading={loading}
                >
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
        <div className="flex items-center px-8 py-4 border-b">
          <div className="w-[40%]">
            <TableHeader
              label="Κωδικός"
              sortField="name"
              currentSortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </div>
          <div className="w-[25%]">
            <TableHeader
              label="Κατηγορία"
              sortField="category"
              currentSortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </div>
          <div className="w-[15%]">
            <TableHeader
              label="Τιμή"
              sortField="price"
              currentSortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </div>
          <div className="w-[12%]">
            <TableHeader
              label="Απόθεμα"
              sortField="stock"
              currentSortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </div>
          {isAdmin && <div className="w-[8%] min-w-[100px]" />}
        </div>
        <div
          ref={parentRef}
          className="relative overflow-auto"
          style={{ height: `calc(100vh - 300px)` }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const code = sortedCodes[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className={cn(
                    "absolute top-0 left-0 w-full border-b",
                    virtualRow.index === sortedCodes.length - 1 && "border-b-0"
                  )}
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <TableRow
                    code={code}
                    isAdmin={isAdmin}
                    onEdit={setEditingCode}
                    onDelete={(code) => {
                      setCodeToDelete(code);
                      setDeleteDialogOpen(true);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {editingCode && (
        <EditCodeDialog
          code={editingCode}
          onClose={() => setEditingCode(null)}
        />
      )}

      {deleteDialogOpen && codeToDelete && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Διαγραφή Κωδικού</DialogTitle>
              <DialogDescription>
                {CODE_MESSAGES.DELETE_CONFIRM}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                {BUTTON_LABELS.CANCEL}
              </Button>
              <LoadingButton
                variant="destructive"
                onClick={handleDelete}
                loading={loading}
              >
                {BUTTON_LABELS.DELETE}
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}