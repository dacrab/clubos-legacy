import { Product, Sale, SaleItem, Register, Category, Subcategory } from "./app"
import { DateRange } from "react-day-picker"
import { LucideIcon } from "lucide-react"
import { HTMLAttributes } from "react"

// Base Types
export interface FormFieldProps extends HTMLAttributes<HTMLInputElement> {
  label: string
  icon?: LucideIcon
  name?: string
  type?: string
  value?: string | number
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  min?: string | number
  max?: string | number
  step?: string | number
}

export interface SelectFieldProps {
  label: string
  icon?: LucideIcon
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  options: { value: string; label: string }[]
  className?: string
  required?: boolean
}

// Auth Components
export interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

// Dashboard Components
export interface DashboardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  heading: string
  description?: string
}

// Date Components
export interface DatePickerProps {
  date: Date | undefined
  onSelect: (date: Date | undefined) => void
  className?: string
}

export interface DateRangePickerProps {
  className?: string
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  align?: "start" | "center" | "end"
}

export interface TableDateFilterProps {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  onClearFilter: () => void
  className?: string
}

// Order Components
export interface OrderItem {
  id: string
  orderId: string
  name: string
  price: number
  is_treat_selected: boolean
}

export interface OrderSummaryProps {
  items: OrderItem[]
  couponsCount: number
  onRemoveItem: (orderId: string) => void
  onToggleTreat: (orderId: string) => void
  onAddCoupon: () => void
  onRemoveCoupon: () => void
  onCompleteSale?: () => void
}

// Product Components
export interface ProductGridProps {
  products: Product[] | null
  onAddToOrder: (product: Product) => void
}

export interface StockStatus {
  label: string
  classes: string
}

export interface ProductsTableProps {
  products: Product[]
  categories: Category[]
  subcategories: Subcategory[]
}

export interface ProductEditPanelProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: string[]
  subcategories: string[]
}

// Register Components
export interface RegistersTableProps {
  registers: Register[]
}

export interface CloseRegisterDialogProps {
  activeRegisterId: string
  totalAmount: number
  itemsSold: number
  couponsUsed: number
  treatsCount: number
  onRegisterClosed?: () => void
}

// Sales Components
export interface RecentSalesProps {
  sales: Sale[]
  userId: string
}

export interface SaleItemRowProps {
  item: SaleItem
  userId: string
  onRefresh: () => void
}

export interface SaleHeaderProps {
  sale: Sale
  isExpanded: boolean
  onToggle: () => void
}

export interface SaleDetailsProps {
  sale: Sale
  userId: string
  onRefresh: () => void
}