import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

import { Role } from '../src/types';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

interface SeedUser {
  email: string;
  password: string;
  name: string;
  role: Role;
}

const seedUsers: SeedUser[] = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
  },
  {
    email: 'staff@example.com',
    password: 'staff123',
    name: 'Staff User',
    role: 'staff',
  },
  {
    email: 'secretary@example.com',
    password: 'secretary123',
    name: 'Secretary User',
    role: 'secretary',
  },
];

// Separate categories data
const seedCategories = [
  {
    name: 'Beverages',
    subcategories: ['Hot Drinks', 'Cold Drinks']
  },
  {
    name: 'Snacks',
    subcategories: ['Sweets', 'Savory']
  },
  {
    name: 'Food',
    subcategories: ['Sandwiches']
  }
];

const seedProducts = [
  {
    name: 'Coffee',
    price: 2.50,
    stock: 100,
    categoryName: 'Beverages',
    subcategoryName: 'Hot Drinks',
  },
  {
    name: 'Tea',
    price: 2.00,
    stock: 100,
    categoryName: 'Beverages',
    subcategoryName: 'Hot Drinks',
  },
  {
    name: 'Iced Coffee',
    price: 3.00,
    stock: 50,
    categoryName: 'Beverages',
    subcategoryName: 'Cold Drinks',
  },
  {
    name: 'Soft Drink',
    price: 2.00,
    stock: 80,
    categoryName: 'Beverages',
    subcategoryName: 'Cold Drinks',
  },
  {
    name: 'Cookie',
    price: 1.50,
    stock: 50,
    categoryName: 'Snacks',
    subcategoryName: 'Sweets',
  },
  {
    name: 'Chocolate Bar',
    price: 2.00,
    stock: 40,
    categoryName: 'Snacks',
    subcategoryName: 'Sweets',
  },
  {
    name: 'Sandwich',
    price: 4.50,
    stock: 20,
    categoryName: 'Food',
    subcategoryName: 'Sandwiches',
  },
  {
    name: 'Chips',
    price: 1.50,
    stock: 60,
    categoryName: 'Snacks',
    subcategoryName: 'Savory',
  },
  {
    name: 'Nuts',
    price: 2.50,
    stock: 45,
    categoryName: 'Snacks',
    subcategoryName: 'Savory',
  },
];

async function main() {
  try {
    console.log('🌱 Starting seeding...');

    let adminId: string | undefined;

    // Create users
    for (const user of seedUsers) {
      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            name: user.name,
          },
        },
      });

      if (authError) {
        console.error(`Error creating user ${user.email}:`, authError.message);
        continue;
      }

      if (!authUser?.user?.id) {
        console.error(`No user ID returned for ${user.email}`);
        continue;
      }

      // Store admin ID for later use
      if (user.role === 'admin') {
        adminId = authUser.user.id;
      }

      // Update user role in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: user.role,
          email: user.email,
          name: user.name,
        })
        .eq('id', authUser.user.id);

      if (profileError) {
        console.error(`Error updating profile for ${user.email}:`, profileError.message);
        continue;
      }

      console.log(`✅ Created user: ${user.email} (${user.role})`);
    }

    // Create categories and products with admin user
    if (adminId) {
      // Sign in as admin
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@example.com',
        password: 'admin123',
      });

      if (signInError) {
        console.error('Error signing in as admin:', signInError.message);
      } else {
        // Create categories and store their IDs
        const categoryMap = new Map<string, string>(); // Map category names to IDs
        const subcategoryMap = new Map<string, string>(); // Map subcategory names to IDs

        // Create main categories first
        for (const category of seedCategories) {
          const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .insert({
              name: category.name,
              last_edited_by: adminId
            })
            .select('id')
            .single();

          if (categoryError) {
            console.error(`Error creating category ${category.name}:`, categoryError.message);
            continue;
          }

          categoryMap.set(category.name, categoryData.id);

          // Create subcategories
          for (const subcategoryName of category.subcategories) {
            const { data: subcategoryData, error: subcategoryError } = await supabase
              .from('categories')
              .insert({
                name: subcategoryName,
                parent_id: categoryData.id,
                last_edited_by: adminId
              })
              .select('id')
              .single();

            if (subcategoryError) {
              console.error(`Error creating subcategory ${subcategoryName}:`, subcategoryError.message);
              continue;
            }

            subcategoryMap.set(`${category.name}-${subcategoryName}`, subcategoryData.id);
          }
        }

        console.log('✅ Created categories and subcategories');

        // Create products with category references
        const productsWithCategories = seedProducts.map(product => {
          const categoryId = categoryMap.get(product.categoryName);
          const subcategoryId = subcategoryMap.get(`${product.categoryName}-${product.subcategoryName}`);

          return {
            name: product.name,
            price: product.price,
            stock: product.stock,
            category_id: categoryId,
            subcategory_id: subcategoryId,
            last_edited_by: adminId
          };
        });

        const { error: productsError } = await supabase
          .from('products')
          .insert(productsWithCategories);

        if (productsError) {
          console.error('Error creating products:', productsError.message);
        } else {
          console.log('✅ Created products');
        }
      }
    } else {
      console.error('No admin user found to create products');
    }

    console.log('✅ Seeding completed!');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
}

main(); 