import { Database } from './supabase';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export type Category = Tables<'categories'> & {
  parent?: Pick<Tables<'categories'>, 'id' | 'name' | 'description'>;
};

export type Product = Tables<'codes'> & {
  category?: Category | null;
};

export type GroupedCategory = {
  main: Category;
  subcategories: Category[];
}; 