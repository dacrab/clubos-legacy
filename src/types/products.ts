import { Tables } from './supabase';

export type Product = Tables<'products'> & {
  category?: Tables<'categories'> | null;
};

export type ProductWithCategory = Tables<'products'> & {
  category: Tables<'categories'> | null;
};

export type Category = Tables<'categories'> & {
  parent?: Pick<Tables<'categories'>, 'id' | 'name' | 'description'>;
};

export type GroupedCategory = {
  main: Category;
  subcategories: Category[];
}; 