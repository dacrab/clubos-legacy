import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users.some(u => u.email === email);
    
    if (userExists) {
      console.log('User already exists:', email);
      // Get the existing user
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const user = users.find(u => u.email === email);
      if (user) return user;
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
    return;
  }

  // Update parent_id for subcategories
  const { error: updateError } = await supabase
    .from('categories')
    .update({ parent_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
    .in('id', ['8f9c5f9d-14e2-4e8c-a92d-3a96d18e2c0e', 'd5f3c4e2-6a8b-4e1c-9f2d-7c8e5d98b1a3']);

  if (updateError) {
    console.error('Error updating category parents:', updateError.message);
    return;
  }

  console.log('Created categories');
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

  const { error } = await supabase.from('codes').insert(products);
  
  if (error) {
    console.error('Error creating products:', error.message);
    return;
  }

  console.log('Created products');
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
    return null;
  }

  console.log('Created register session');
  return session;
}

async function createSales(staffId: string) {
  // Create an order first
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      id: 'f8e7d6c5-b4a3-4e2f-91b2-890123456def',
      register_session_id: 'e9d8c7b6-a5f4-4e3d-b2c1-1a2b3c4d5e6f',
      total_amount: 7.50,    // Sum of all original prices (2.00 + 3.50 + 2.00)
      final_amount: 3.50,    // After all discounts (7.50 - 4.00)
      card_discount_count: 1, // One €2 card discount used
      created_by: staffId
    })
    .select()
    .single();

  if (orderError) {
    console.error('Error creating order:', orderError.message);
    return;
  }

  // Create sales linked to the order
  const sales = [
    {
      id: 'f8e7d6c5-b4a3-4e2f-91b2-890123456abc',
      order_id: order.id,
      code_id: 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a', // Espresso
      quantity: 1,
      unit_price: 2.00,
      total_price: 2.00,     // Now storing actual price, UI will show "Δωρεάν"
      is_treat: true
    },
    {
      id: 'a7f6e5d4-c3b2-4a3f-82e1-901234567abc',
      order_id: order.id,
      code_id: 'e5f6a7b8-c9d0-4e9f-b3a4-456789012abc', // Chocolate
      quantity: 1,
      unit_price: 3.50,
      total_price: 3.50,     // Original price (discount is handled at order level)
      is_treat: false
    },
    {
      id: 'b6a5f4e3-d2c1-4b3a-92f1-012345678abc',
      order_id: order.id,
      code_id: 'a7b8c9d0-e1f2-4a1b-d5c6-678901234abc', // Chips
      quantity: 1,
      unit_price: 2.00,
      total_price: 2.00,     // Original price
      is_treat: false
    }
  ];

  const { error } = await supabase.from('sales').insert(sales);
  
  if (error) {
    console.error('Error creating sales:', error.message);
    return;
  }

  console.log('Created order and sales');
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
    return;
  }

  console.log('Created appointments');
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
    return;
  }

  console.log('Created football bookings');
}

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Create users
    console.log('Creating admin user...');
    const admin = await createUser('admin@example.com', 'admin123', { role: 'admin', username: 'Admin User' });
    if (!admin) {
      throw new Error('Failed to create admin user');
    }

    console.log('Creating staff user...');
    const staff = await createUser('staff@example.com', 'staff123', { role: 'employee', username: 'Staff One' });
    if (!staff) {
      throw new Error('Failed to create staff user');
    }

    console.log('Creating secretary user...');
    const secretary = await createUser('secretary@example.com', 'secretary123', { role: 'secretary', username: 'Secretary User' });
    if (!secretary) {
      throw new Error('Failed to create secretary user');
    }

    // Create other data
    console.log('Creating categories...');
    await createCategories(admin.id);
    
    console.log('Creating products...');
    await createProducts(admin.id);
    
    console.log('Creating register session...');
    const session = await createRegisterSession();
    if (!session) {
      throw new Error('Failed to create register session');
    }
    
    console.log('Creating sales...');
    await createSales(staff.id);
    
    console.log('Creating appointments...');
    await createAppointments(staff.id);
    
    console.log('Creating football bookings...');
    await createFootballBookings(staff.id);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
  } finally {
    // Add a small delay before exiting to ensure all console logs are printed
    await new Promise(resolve => setTimeout(resolve, 1000));
    process.exit(0);
  }
}

seedDatabase();