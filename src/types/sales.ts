import { Sale, SaleItem } from './app'

// Raw types from Supabase
export interface RawProduct {
  id: string
  name: string
  price: number
  is_deleted: boolean
}

export interface RawSaleItem {
  id: string
  quantity: number
  price_at_sale: number
  is_treat: boolean
  created_at: string
  last_edited_by: string | null
  last_edited_at: string | null
  is_deleted: boolean
  deleted_by: string | null
  deleted_at: string | null
  product: RawProduct | null
}

export interface RawProfile {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff'
}

export interface RawRegister {
  id: string
  coupons_used: number
  opened_at: string
  closed_at: string | null
  closed_by_name: string | null
}

export interface RawSupabaseResponse {
  id: string
  created_at: string
  total_amount: number
  coupon_applied: boolean
  coupons_used: number
  profiles: RawProfile[]
  sale_items: RawSaleItem[]
  registers: RawRegister[]
}

// Transform functions
export const transformSaleItems = (items: RawSaleItem[]): SaleItem[] => {
  return items.map((item): SaleItem => {
    // Ensure product exists
    if (!item.product) {
      console.error('Missing or invalid product data:', item);
      // Return a placeholder product to prevent UI crashes
      const placeholderProduct = {
        id: 'missing',
        name: 'Product Not Found',
        price: 0,
        is_deleted: true
      };
      return {
        id: item.id,
        quantity: item.quantity,
        price_at_sale: item.price_at_sale,
        product: placeholderProduct,
        products: placeholderProduct,
        is_treat: item.is_treat,
        last_edited_by: item.last_edited_by,
        last_edited_at: item.last_edited_at,
        is_deleted: true,
        deleted_by: item.deleted_by,
        deleted_at: item.deleted_at,
        created_at: item.created_at
      };
    }

    return {
      id: item.id,
      quantity: item.quantity,
      price_at_sale: item.price_at_sale,
      product: item.product,
      products: item.product,
      is_treat: item.is_treat,
      last_edited_by: item.last_edited_by,
      last_edited_at: item.last_edited_at,
      is_deleted: item.is_deleted || false,
      deleted_by: item.deleted_by,
      deleted_at: item.deleted_at,
      created_at: item.created_at
    };
  });
}

export const transformSales = (salesData: RawSupabaseResponse[]): Sale[] => {
  return salesData
    .map((sale): Sale | null => {
      // Add validation for required fields
      if (!sale || !sale.id || !sale.created_at) {
        console.error('Invalid sale data:', sale);
        return null;
      }

      // Get profile data with proper fallback
      const profile = sale.profiles?.[0];
      const profileRole = profile?.role?.toLowerCase();
      const defaultName = profileRole === 'admin' ? 'Admin' : 'Staff';

      // Transform and validate sale items
      const transformedItems = transformSaleItems(sale.sale_items || []);

      return {
        id: sale.id,
        created_at: sale.created_at,
        total_amount: sale.total_amount || 0,
        coupon_applied: sale.coupon_applied || false,
        coupons_used: sale.coupons_used || 0,
        profile: {
          id: profile?.id || '',
          name: profile?.name || defaultName,
          email: profile?.email || ''
        },
        register: {
          id: sale.registers?.[0]?.id || '',
          coupons_used: sale.registers?.[0]?.coupons_used || 0,
          opened_at: sale.registers?.[0]?.opened_at || '',
          closed_at: sale.registers?.[0]?.closed_at || null,
          closed_by_name: sale.registers?.[0]?.closed_by_name || null
        },
        sale_items: transformedItems.filter(Boolean)
      };
    })
    .filter((sale): sale is Sale => sale !== null);
}

// Component Props Types
export interface RecentSalesProps {
  sales: Sale[] | null
  showEditStatus?: boolean
  userId: string
}

export interface RecentSalesRef {
  clearSales: () => void
}

export interface SaleHeaderProps {
  sale: Sale
  isExpanded: boolean
  onToggle: () => void
}

export interface SaleItemProps {
  item: SaleItem
  userId: string
  onRefresh: () => void
}

export interface SaleDetailsProps {
  sale: Sale
  userId: string
  onRefresh: () => void
}

export interface TotalDisplayProps {
  subtotal: number
  couponsUsed: number
}