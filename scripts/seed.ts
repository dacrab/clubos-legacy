import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { resolve } from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase URL or service role key');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUser(email: string, password: string, metadata: { role: 'admin' | 'employee' | 'secretary', username: string }) {
  try {
    // First check if user already exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('Error listing users:', listError);
      return null;
    }
    
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
      console.log('User already exists:', email);
      return existingUser;
    }

    // Create new user if doesn't exist
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (createError) {
      console.error('Error creating user:', email);
      console.error('Error details:', createError);
      return null;
    }

    if (!user) {
      console.error('No user returned after creation:', email);
      return null;
    }

    console.log('Created user:', email);
    return user;
  } catch (error) {
    console.error('Unexpected error creating user:', email);
    console.error('Error details:', error);
    return null;
  }
}

async function clearDatabase() {
  console.log('  - Clearing database...');

  const tables = [
    'sales',
    'orders',
    'appointments',
    'football_field_bookings',
    'products',
    'categories',
    'register_sessions',
  ];

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.error(`Error clearing table ${table}:`, error.message);
      throw new Error(`Failed to clear table ${table}`);
    }
  }

  // Clear users
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error listing users for deletion:', listError);
    throw new Error('Failed to list users for deletion');
  }

  for (const user of users) {
    await supabase.auth.admin.deleteUser(user.id);
  }

  // Add a delay to ensure users are deleted before recreating them
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('  ✅ Database cleared');
}

async function createCategories(adminId: string) {
  const categories = [
    {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      name: 'Καφέδες',
      description: 'Όλα τα είδη καφέ',
      created_by: adminId
    },
    {
      id: '8f9c5f9d-14e2-4e8c-a92d-3a96d18e2c0e',
      name: 'Ζεστοί Καφέδες',
      description: 'Ζεστοί καφέδες',
      created_by: adminId
    },
    {
      id: 'd5f3c4e2-6a8b-4e1c-9f2d-7c8e5d98b1a3',
      name: 'Κρύοι Καφέδες',
      description: 'Κρύοι καφέδες',
      created_by: adminId
    },
    {
      id: 'c6e8f9d2-3b7a-4c6d-9e5f-8a2d1b4c7e3a',
      name: 'Ροφήματα',
      description: 'Διάφορα ροφήματα',
      created_by: adminId
    },
    {
      id: 'b7d6e5c4-2a9f-4b8e-8d7c-6f5e4d3c2b1a',
      name: 'Σνακ',
      description: 'Διάφορα σνακ',
      created_by: adminId
    }
  ];

  const { error } = await supabase.from('categories').insert(categories);
  
  if (error) {
    console.error('Error creating categories:', error.message);
    throw new Error('Failed to create categories');
  }

  // Update parent_id for subcategories
  const { error: updateError } = await supabase
    .from('categories')
    .update({ parent_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
    .in('id', ['8f9c5f9d-14e2-4e8c-a92d-3a96d18e2c0e', 'd5f3c4e2-6a8b-4e1c-9f2d-7c8e5d98b1a3']);

  if (updateError) {
    console.error('Error updating category parents:', updateError.message);
    throw new Error('Failed to update category parents');
  }

  console.log('✅ Created categories');
}

async function createProducts(adminId: string) {
  const products = [
    // Hot Coffees
    {
      id: 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a',
      name: 'Espresso',
      price: 2.00,
      stock: -1,
      category_id: '8f9c5f9d-14e2-4e8c-a92d-3a96d18e2c0e',
      created_by: adminId
    },
    {
      id: 'b2c3d4e5-f6a7-4b6c-8d1e-123456789abc',
      name: 'Cappuccino',
      price: 3.00,
      stock: -1,
      category_id: '8f9c5f9d-14e2-4e8c-a92d-3a96d18e2c0e',
      created_by: adminId
    },
    // Cold Coffees
    {
      id: 'c3d4e5f6-a7b8-4c7d-91ef-234567890abc',
      name: 'Freddo Espresso',
      price: 3.00,
      stock: -1,
      category_id: 'd5f3c4e2-6a8b-4e1c-9f2d-7c8e5d98b1a3',
      created_by: adminId
    },
    {
      id: 'd4e5f6a7-b8c9-4d8e-a2f3-345678901abc',
      name: 'Freddo Cappuccino',
      price: 3.50,
      stock: -1,
      category_id: 'd5f3c4e2-6a8b-4e1c-9f2d-7c8e5d98b1a3',
      created_by: adminId
    },
    // Beverages
    {
      id: 'e5f6a7b8-c9d0-4e9f-b3a4-456789012abc',
      name: 'Σοκολάτα',
      price: 3.50,
      stock: -1,
      category_id: 'c6e8f9d2-3b7a-4c6d-9e5f-8a2d1b4c7e3a',
      created_by: adminId
    },
    {
      id: 'f6a7b8c9-d0e1-4f0a-c4b5-567890123abc',
      name: 'Τσάι',
      price: 2.50,
      stock: -1,
      category_id: 'c6e8f9d2-3b7a-4c6d-9e5f-8a2d1b4c7e3a',
      created_by: adminId
    },
    // Snacks
    {
      id: 'a7b8c9d0-e1f2-4a1b-d5c6-678901234abc',
      name: 'Κρουασάν',
      price: 2.00,
      stock: 20,
      category_id: 'b7d6e5c4-2a9f-4b8e-8d7c-6f5e4d3c2b1a',
      created_by: adminId
    },
    {
      id: 'b8c9d0e1-f2a3-4b2c-e6d7-789012345abc',
      name: 'Σάντουιτς',
      price: 3.50,
      stock: 15,
      category_id: 'b7d6e5c4-2a9f-4b8e-8d7c-6f5e4d3c2b1a',
      created_by: adminId
    }
  ];

  const { error } = await supabase.from('products').insert(products);
  
  if (error) {
    console.error('Error creating products:', error.message);
    throw new Error('Failed to create products');
  }

  console.log('✅ Created products');
}

async function createRegisterSession() {
  const { data: session, error } = await supabase
    .from('register_sessions')
    .insert({
      id: 'e9d8c7b6-a5f4-4e3d-b2c1-1a2b3c4d5e6f'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating register session:', error.message);
    throw new Error('Failed to create register session');
  }

  console.log('✅ Created register session');
  return session;
}

async function createSales(staffId: string, registerSessionId: string) {
  // Create an order first
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      id: 'f8e7d6c5-b4a3-4e2f-91b2-890123456def',
      register_session_id: registerSessionId,
      total_amount: 7.50,
      final_amount: 3.50,
      card_discount_count: 1,
      created_by: staffId
    })
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError.message);
    throw new Error('Failed to create order');
  }

  // Create sales linked to the order
  const sales = [
    {
      id: 'f8e7d6c5-b4a3-4e2f-91b2-890123456abc',
      order_id: order.id,
      product_id: 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a', // Espresso
      quantity: 1,
      unit_price: 2.00,
      total_price: 2.00,
      is_treat: true
    },
    {
      id: 'a7f6e5d4-c3b2-4a3f-82e1-901234567abc',
      order_id: order.id,
      product_id: 'e5f6a7b8-c9d0-4e9f-b3a4-456789012abc', // Chocolate
      quantity: 1,
      unit_price: 3.50,
      total_price: 3.50,
      is_treat: false
    },
    {
      id: 'b6a5f4e3-d2c1-4b3a-92f1-012345678abc',
      order_id: order.id,
      product_id: 'a7b8c9d0-e1f2-4a1b-d5c6-678901234abc', // Κρουασάν
      quantity: 1,
      unit_price: 2.00,
      total_price: 2.00,
      is_treat: false
    }
  ];

  const { error } = await supabase.from('sales').insert(sales);
  
  if (error) {
    console.error('Error creating sales:', error.message);
    throw new Error('Failed to create sales');
  }

  console.log('✅ Created order and sales');
}

async function createAppointments(staffId: string) {
  const appointments = [
    {
      id: 'c5b4a3f2-e1d0-4c3b-a2a1-123456789abc',
      who_booked: 'Μαρία Παπαδοπούλου',
      date_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // 2 days + 14 hours
      contact_details: '6912345678',
      num_children: 3,
      num_adults: 2,
      notes: 'Γενέθλια παιδιού',
      user_id: staffId
    },
    {
      id: 'd4c3b2a1-f0e9-4d3c-b2b1-234567890abc',
      who_booked: 'Γιώργος Δημητρίου',
      date_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // 3 days + 16 hours
      contact_details: '6923456789',
      num_children: 5,
      num_adults: 3,
      notes: 'Σχολική εκδρομή',
      user_id: staffId
    }
  ];

  const { error } = await supabase.from('appointments').insert(appointments);
  
  if (error) {
    console.error('Error creating appointments:', error.message);
    throw new Error('Failed to create appointments');
  }

  console.log('✅ Created appointments');
}

async function createFootballBookings(staffId: string) {
  const bookings = [
    {
      id: 'e3d2c1b0-a9f8-4e3d-c2c1-345678901abc',
      who_booked: 'Νίκος Αντωνίου',
      booking_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // 1 day + 18 hours
      contact_details: '6934567890',
      field_number: 1,
      num_players: 10,
      notes: 'Εβδομαδιαίο παιχνίδι',
      user_id: staffId
    },
    {
      id: 'f2e1d0c9-b8a7-4f3e-d2d1-456789012abc',
      who_booked: 'Κώστας Νικολάου',
      booking_datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // 2 days + 19 hours
      contact_details: '6945678901',
      field_number: 2,
      num_players: 8,
      notes: 'Φιλικό παιχνίδι',
      user_id: staffId
    }
  ];

  const { error } = await supabase.from('football_field_bookings').insert(bookings);
  
  if (error) {
    console.error('Error creating football bookings:', error.message);
    throw new Error('Failed to create football bookings');
  }

  console.log('✅ Created football bookings');
}

async function seedDatabase() {
  try {
    console.log('⏳ Starting database seeding...');
    
    await clearDatabase();

    // Step 1: Create users sequentially as they are prerequisites for everything.
    console.log('  - Creating users...');
    const admin = await createUser('admin@example.com', 'admin123', { role: 'admin', username: 'Admin User' });
    if (!admin) throw new Error('Failed to create admin user');

    const staff = await createUser('staff@example.com', 'staff123', { role: 'employee', username: 'Staff User' });
    if (!staff) throw new Error('Failed to create staff user');

    const secretary = await createUser('secretary@example.com', 'secretary123', { role: 'secretary', username: 'Secretary User' });
    if (!secretary) throw new Error('Failed to create secretary user');
    console.log('  ✅ Users created');

    // Step 2: Create data with dependencies.
    // These are run sequentially to respect foreign key constraints.
    console.log('  - Creating catalog data...');
    await createCategories(admin.id);
    await createProducts(admin.id);
    console.log('  ✅ Catalog data created');

    console.log('  - Creating initial operational data...');
    const session = await createRegisterSession();
    await createSales(staff.id, session.id);
    console.log('  ✅ Operational data created');

    // Step 3: Create independent data in parallel for efficiency.
    console.log('  - Creating bookings and appointments in parallel...');
    await Promise.all([
      createAppointments(staff.id),
      createFootballBookings(staff.id),
    ]);
    console.log('  ✅ Bookings and appointments created');

    console.log('🚀 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    if (error instanceof Error) {
      console.error('  Error details:', error.message);
    }
    throw error;
  }
}

if (resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  seedDatabase().catch((error) => {
    console.error('Error executing seed script:', error);
    process.exit(1);
  });
}

export {
  seedDatabase,
  createUser,
  createCategories,
  createProducts,
  createRegisterSession,
  createSales,
  createAppointments,
  createFootballBookings,
  supabase,
};