// Product and Category types based on Drizzle schema
export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: string; // Decimal as string
  costPrice?: string | null;
  stock: number;
  minStockLevel: number;
  categoryId?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  trackInventory: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  category?: Category | null;
}

export interface ProductWithCategory extends Product {
  category: Category | null;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  parent?: Pick<Category, 'id' | 'name' | 'description'> | null;
}

export interface GroupedCategory {
  main: Category;
  subcategories: Category[];
}