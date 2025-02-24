// Core types from app.ts
export {
  type ID,
  type Timestamp,
  type Role,
  type SearchParamsValue,
  type TypedSupabaseClient,
  type BaseEntity,
  type Profile,
  type Product,
  type Category,
  type Subcategory,
  type SaleItemProduct,
  type SaleItem,
  type Sale,
  type Register,
  type Appointment,
  type DashboardState,
  type RecentSalesRef
} from './app'

// UI component types from ui.ts
export {
  type ButtonProps,
  type InputProps,
  type LabelProps,
  type SelectProps,
  type CalendarProps,
  type SheetProps,
  type SheetTriggerProps,
  type SheetContentProps,
  type SheetHeaderProps,
  type SheetFooterProps,
  type SheetTitleProps,
  type SheetDescriptionProps
} from './ui'

// Component prop types from components.ts
export {
  type OrderItem,
  type OrderSummaryProps,
  type ProductGridProps,
  type StockStatus,
  type ProductsTableProps,
  type ProductEditPanelProps,
  type RecentSalesProps,
  type SaleItemRowProps,
  type SaleHeaderProps,
  type SaleDetailsProps,
  type FormFieldProps,
  type SelectFieldProps,
  type DatePickerProps,
  type DateRangePickerProps,
  type TableDateFilterProps,
  type RegistersTableProps,
  type CloseRegisterDialogProps,
  type SignOutButtonProps
} from './components'

// Layout types from layout.ts
export {
  type RootLayoutProps,
  type DashboardLayoutProps,
  type StaffLayoutProps,
  type DashboardHeaderProps
} from './layout'

// Database types from supabase.ts
export {
  type Json,
  type Database,
  type SupabaseSaleItem,
  type RawSupabaseResponse
} from './supabase' 