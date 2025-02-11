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

const seedProducts = [
  {
    name: 'Coffee',
    price: 2.50,
    stock: 100,
    category: 'Beverages',
    subcategory: 'Hot Drinks',
  },
  {
    name: 'Tea',
    price: 2.00,
    stock: 100,
    category: 'Beverages',
    subcategory: 'Hot Drinks',
  },
  {
    name: 'Iced Coffee',
    price: 3.00,
    stock: 50,
    category: 'Beverages',
    subcategory: 'Cold Drinks',
  },
  {
    name: 'Soft Drink',
    price: 2.00,
    stock: 80,
    category: 'Beverages',
    subcategory: 'Cold Drinks',
  },
  {
    name: 'Cookie',
    price: 1.50,
    stock: 50,
    category: 'Snacks',
    subcategory: 'Sweets',
  },
  {
    name: 'Chocolate Bar',
    price: 2.00,
    stock: 40,
    category: 'Snacks',
    subcategory: 'Sweets',
  },
  {
    name: 'Sandwich',
    price: 4.50,
    stock: 20,
    category: 'Food',
    subcategory: 'Sandwiches',
  },
  {
    name: 'Chips',
    price: 1.50,
    stock: 60,
    category: 'Snacks',
    subcategory: 'Savory',
  },
  {
    name: 'Nuts',
    price: 2.50,
    stock: 45,
    category: 'Snacks',
    subcategory: 'Savory',
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

    // Create products with admin user
    if (adminId) {
      // Sign in as admin
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@example.com',
        password: 'admin123',
      });

      if (signInError) {
        console.error('Error signing in as admin:', signInError.message);
      } else {
        const { error: productsError } = await supabase
          .from('products')
          .insert(seedProducts.map(product => ({
            ...product,
            last_edited_by: adminId
          })));

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