import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from './supabase'
import { User } from '@supabase/supabase-js'
import { HTMLAttributes, ReactNode } from 'react'

// Client type
export type TypedSupabaseClient = SupabaseClient<Database>

// Layout Types
export interface DashboardLayoutProps {
  children: ReactNode
}

export interface StaffLayoutProps {
  children: ReactNode
}

// Common types
export type ID = string
export type Timestamp = string
export type Role = 'admin' | 'staff' | 'secretary'

// Request/Response types
export type SearchParamsValue = Record<string, string | string[] | undefined>

export type NextPageProps<T = Record<string, unknown>> = {
  params: Promise<T>
  searchParams?: Promise<SearchParamsValue>
}

// Dashboard Components
export interface DashboardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  heading: string
  description?: string
  children?: React.ReactNode
}

// Product Types
export interface Category {
  id: string
  name: string
  parent_id?: string | null
}

export interface Subcategory extends Category {
  parent_id: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  is_treat: boolean
  image_url: string | null
  category_id: string | null
  subcategory_id: string | null
  last_edited_by?: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  category?: {
    id: string
    name: string
  } | null
  subcategory?: {
    id: string
    name: string
  } | null
}

export interface ProductFormValues {
  name: string
  description?: string
  price: string
  quantity: string
  isTreat: boolean
}

export interface ProductEditPanelProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: string[]
  subcategories: string[]
}

export interface ProductsTableProps {
  products: Product[]
  categories: Category[]
  subcategories: Subcategory[]
}

export interface ManageCategoriesDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export interface NewProductSheetProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

// Sales Types
export interface OrderItem extends Product {
  orderId: string
  is_treat_selected: boolean
}

export interface SalesPanelProps {
  products: Product[] | null
  isOpen: boolean
  onClose: () => void
}

export interface CategorySelectorProps {
  categories: Category[]
  subcategories: Category[]
  selectedCategory: string | null
  selectedSubcategory: string | null
  onSelectCategory: (categoryId: string | null) => void
  onSelectSubcategory: (subcategoryId: string | null) => void
}

export interface DeleteSaleItemDialogProps {
  saleItemId: string
  productName: string
  userId: string
  onDelete: () => void
  createdAt: string
}

export interface EditSaleItemDialogProps {
  saleItemId: string
  productName: string
  currentQuantity: number
  currentProductId: string
  userId: string
  onEdit: () => void
  createdAt: string
}

export interface SalesTableProps {
  sales: Sale[] | null
}

// Register Types
export interface CloseRegisterDialogProps {
  activeRegisterId: string
  totalAmount: number
  itemsSold: number
  couponsUsed: number
  treatsCount: number
  onRegisterClosed?: () => void
}

export interface RegistersTableProps {
  registers: Register[] | null
}

// User Types
export interface UserBase {
  id: string
  name: string
  email: string
  role?: Role
}

export interface DeleteUserDialogProps {
  user: UserBase
}

export interface EditUserDialogProps {
  user: UserBase & { role: Role }
}

export interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

// Raw Data interfaces for Supabase responses
export interface RawSaleProduct {
  id: string
  name: string
  price: number
  is_deleted: boolean
}

export interface RawSaleItem {
  id: string
  sale_id: string
  product_id: string
  quantity: number
  price_at_sale: number
  is_treat: boolean
  created_at: string
  last_edited_by: string | null
  last_edited_at: string | null
  is_deleted: boolean
  deleted_by: string | null
  deleted_at: string | null
  product?: {
    id: string
    name: string
    price: number
    is_deleted: boolean
  } | null
}

export interface RawSaleResponse {
  id: string
  register_id: string
  total_amount: number
  coupon_applied: boolean
  coupons_used: number
  created_by: string
  created_at: string
  updated_at: string
  profiles: {
    id: string
    name: string
    email: string
  }[]
  registers: {
    id: string
    coupons_used: number
    opened_at: string
    closed_at: string | null
    closed_by_name: string | null
  }[]
  sale_items: RawSaleItem[]
}

export interface RawSaleProfile {
  id: string
  name: string
  email: string
}

export interface RawSaleRegister {
  id: string
  coupons_used: number
  opened_at: string
  closed_at: string | null
  closed_by_name: string | null
}

export interface RawSale {
  id: string
  created_at: string
  total_amount: number
  coupon_applied: boolean
  coupons_used: number
  profiles: RawSaleProfile[]
  registers: RawSaleRegister[]
  sale_items: RawSaleItem[]
}

// Dashboard State interfaces
export interface DashboardState {
  user: User | null
  profile: Profile | null
  recentSales: Sale[]
  activeRegister: Register | null
  isLoading: boolean
}

// Entity interfaces
export interface BaseEntity {
  id: ID
  created_at?: Timestamp
  updated_at?: Timestamp
}

export interface Profile extends BaseEntity {
  role: Role
  name: string
}

export interface Register extends BaseEntity {
  items_sold: number
  coupons_used: number
  treat_items_sold: number
  total_amount: number
  closed_at: Timestamp | null
  opened_at: Timestamp
  profiles?: {
    id: string
    name: string
    email: string
  }
  sales?: Sale[]
}

// Product Types for Sales
export interface SaleItemProduct {
  id: string
  name: string
  price: number
  is_deleted: boolean
}

export interface SaleItem extends BaseEntity {
  quantity: number
  price_at_sale: number
  products: SaleItemProduct
  is_treat: boolean
  created_at: Timestamp
  marked_as_treat_by?: ID | null
  marked_as_treat_at?: Timestamp | null
  last_edited_by: ID | null
  last_edited_at: Timestamp | null
  is_deleted: boolean
  deleted_by: ID | null
  deleted_at: Timestamp | null
}

export interface Sale extends BaseEntity {
  created_at: Timestamp
  total_amount: number
  coupon_applied: boolean
  coupons_used: number
  profile: {
    id: ID
    name: string
    email: string
  }
  register: {
    id: ID
    coupons_used: number
    opened_at: Timestamp
    closed_at: Timestamp | null
    closed_by_name: string | null
  }
  sale_items: SaleItem[]
}

// Appointment Types
export interface AppointmentCardProps {
  appointment: Appointment
}

export interface AppointmentsCalendarProps {
  appointments: Appointment[] | null
}

export interface UpcomingPartiesProps extends React.HTMLAttributes<HTMLDivElement> {
  parties: Appointment[] | null
}

export interface Appointment extends BaseEntity {
  type: 'football' | 'party'
  start_time: string
  end_time: string
  customer_name: string
  customer_phone: string
  notes?: string
  guests?: number
  created_by: string
}

export type AppointmentFormData = {
  type: "football" | "party"
  startTime: string
  endTime: string
  customerName: string
  customerPhone: string
  notes: string
  guests?: number
}

// Auth Types
export interface LoginFormData {
  username: string
  password: string
}

export const LoginErrorMessages = {
  invalidCredentials: {
    title: "Invalid credentials",
    description: "The username or password you entered is incorrect."
  },
  profileError: {
    title: "Profile error",
    description: "Unable to retrieve your user profile. Please try again."
  },
  connectionError: {
    title: "Connection error",
    description: "Unable to connect to the server. Please check your internet connection and try again."
  }
} as const

// Provider Types
export interface ReactQueryProviderProps {
  children: ReactNode
}