// Core types
export {
  type ID,
  type Timestamp,
  type Role,
  type SearchParamsValue,
  type TypedSupabaseClient,
  type BaseEntity,
} from './app'

// User & Profile types
export {
  type Profile,
} from './app'

// Product & Category types
export {
  type Product,
  type Category, 
  type Subcategory,
} from './app'

// Sales types
export {
  type SaleItemProduct,
  type SaleItem,
  type Sale,
  type Register,
} from './app'

// Appointment types
export {
  type Appointment,
} from './app'

// Dashboard types
export {
  type DashboardState,
  type RecentSalesRef
} from './app'

// UI component types
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

// Form & Input components
export {
  type FormFieldProps,
  type SelectFieldProps,
  type DatePickerProps,
  type DateRangePickerProps,
  type TableDateFilterProps,
} from './components'

// Product components
export {
  type OrderItem,
  type OrderSummaryProps,
  type ProductGridProps,
  type StockStatus,
  type ProductsTableProps,
  type ProductEditPanelProps,
} from './components'

// Sales components
export {
  type RecentSalesProps,
  type SaleItemRowProps,
  type SaleHeaderProps,
  type SaleDetailsProps,
  type RegistersTableProps,
  type CloseRegisterDialogProps,
} from './components'

// Auth components
export {
  type SignOutButtonProps
} from './components'

// Layout types
export {
  type RootLayoutProps,
  type DashboardLayoutProps,
  type StaffLayoutProps,
  type DashboardHeaderProps
} from './layout'

// Database types
export {
  type Json,
  type Database,
  type SupabaseSaleItem,
  type RawSupabaseResponse
} from './supabase'