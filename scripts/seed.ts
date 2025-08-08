#!/usr/bin/env bun

import { db } from '../src/lib/db';
import { users, categories, products, registerSessions, orders, sales, appointments, footballFieldBookings } from '../src/lib/db/schema';

async function clearDatabase() {
  console.log('  - Clearing database...');
  
  // Clear in reverse dependency order
  await db.delete(sales);
  await db.delete(orders);
  await db.delete(appointments);
  await db.delete(footballFieldBookings);
  await db.delete(products);
  await db.delete(categories);
  await db.delete(registerSessions);
  await db.delete(users);
  
  console.log('  ✅ Database cleared');
}

async function createUser(email: string, username: string, role: 'admin' | 'employee' | 'secretary') {
  const userId = crypto.randomUUID();
  
  await db.insert(users).values({
    id: userId,
    email,
    username,
    role,
  }).onConflictDoNothing();

  console.log('Created user:', email);
  return { id: userId, email, username, role };
}

async function clearDatabase() {
  const supabase = getSupabaseClient();
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
  const mainCategoryId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
  
  // Create main category first
  await db.insert(categories).values({
    id: mainCategoryId,
    name: 'Καφέδες',
    description: 'Όλα τα είδη καφέ',
    createdBy: adminId
  }).onConflictDoNothing();

  // Create subcategories
  await db.insert(categories).values([
    {
      id: '8f9c5f9d-14e2-4e8c-a92d-3a96d18e2c0e',
      name: 'Ζεστοί Καφέδες',
      description: 'Ζεστοί καφέδες',
      parentId: mainCategoryId,
      createdBy: adminId
    },
    {
      id: 'd5f3c4e2-6a8b-4e1c-9f2d-7c8e5d98b1a3',
      name: 'Κρύοι Καφέδες',
      description: 'Κρύοι καφέδες',
      parentId: mainCategoryId,
      createdBy: adminId
    },
    {
      id: 'c6e8f9d2-3b7a-4c6d-9e5f-8a2d1b4c7e3a',
      name: 'Ροφήματα',
      description: 'Διάφορα ροφήματα',
      createdBy: adminId
    },
    {
      id: 'b7d6e5c4-2a9f-4b8e-8d7c-6f5e4d3c2b1a',
      name: 'Σνακ',
      description: 'Διάφορα σνακ',
      createdBy: adminId
    }
  ]).onConflictDoNothing();

  console.log('✅ Created categories');
}

async function createProducts(adminId: string) {
  await db.insert(products).values([
    // Hot Coffees
    {
      id: 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a',
      name: 'Espresso',
      price: '2.00',
      stock: -1,
      categoryId: '8f9c5f9d-14e2-4e8c-a92d-3a96d18e2c0e',
      createdBy: adminId
    },
    {
      id: 'b2c3d4e5-f6a7-4b6c-8d1e-123456789abc',
      name: 'Cappuccino',
      price: '3.00',
      stock: -1,
      categoryId: '8f9c5f9d-14e2-4e8c-a92d-3a96d18e2c0e',
      createdBy: adminId
    },
    // Cold Coffees
    {
      id: 'c3d4e5f6-a7b8-4c7d-91ef-234567890abc',
      name: 'Freddo Espresso',
      price: '3.00',
      stock: -1,
      categoryId: 'd5f3c4e2-6a8b-4e1c-9f2d-7c8e5d98b1a3',
      createdBy: adminId
    },
    {
      id: 'd4e5f6a7-b8c9-4d8e-a2f3-345678901abc',
      name: 'Freddo Cappuccino',
      price: '3.50',
      stock: -1,
      categoryId: 'd5f3c4e2-6a8b-4e1c-9f2d-7c8e5d98b1a3',
      createdBy: adminId
    },
    // Beverages
    {
      id: 'e5f6a7b8-c9d0-4e9f-b3a4-456789012abc',
      name: 'Σοκολάτα',
      price: '3.50',
      stock: -1,
      categoryId: 'c6e8f9d2-3b7a-4c6d-9e5f-8a2d1b4c7e3a',
      createdBy: adminId
    },
    {
      id: 'f6a7b8c9-d0e1-4f0a-c4b5-567890123abc',
      name: 'Τσάι',
      price: '2.50',
      stock: -1,
      categoryId: 'c6e8f9d2-3b7a-4c6d-9e5f-8a2d1b4c7e3a',
      createdBy: adminId
    },
    // Snacks
    {
      id: 'a7b8c9d0-e1f2-4a1b-d5c6-678901234abc',
      name: 'Κρουασάν',
      price: '2.00',
      stock: 20,
      categoryId: 'b7d6e5c4-2a9f-4b8e-8d7c-6f5e4d3c2b1a',
      createdBy: adminId
    },
    {
      id: 'b8c9d0e1-f2a3-4b2c-e6d7-789012345abc',
      name: 'Σάντουιτς',
      price: '3.50',
      stock: 15,
      categoryId: 'b7d6e5c4-2a9f-4b8e-8d7c-6f5e4d3c2b1a',
      createdBy: adminId
    }
  ]).onConflictDoNothing();

  console.log('✅ Created products');
}

async function createRegisterSession() {
  const sessionId = 'e9d8c7b6-a5f4-4e3d-b2c1-1a2b3c4d5e6f';
  
  await db.insert(registerSessions).values({
    id: sessionId,
  }).onConflictDoNothing();

  console.log('✅ Created register session');
  return { id: sessionId };
}

async function createSales(staffId: string, registerSessionId: string) {
  const orderId = 'f8e7d6c5-b4a3-4e2f-91b2-890123456def';
  
  // Create an order first
  await db.insert(orders).values({
    id: orderId,
    registerSessionId: registerSessionId,
    totalAmount: '7.50',
    finalAmount: '3.50',
    cardDiscountCount: 1,
    createdBy: staffId
  }).onConflictDoNothing();

  // Create sales linked to the order
  await db.insert(sales).values([
    {
      id: 'f8e7d6c5-b4a3-4e2f-91b2-890123456abc',
      orderId: orderId,
      productId: 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a', // Espresso
      quantity: 1,
      unitPrice: '2.00',
      totalPrice: '2.00',
      isTreat: true
    },
    {
      id: 'a7f6e5d4-c3b2-4a3f-82e1-901234567abc',
      orderId: orderId,
      productId: 'e5f6a7b8-c9d0-4e9f-b3a4-456789012abc', // Chocolate
      quantity: 1,
      unitPrice: '3.50',
      totalPrice: '3.50',
      isTreat: false
    },
    {
      id: 'b6a5f4e3-d2c1-4b3a-92f1-012345678abc',
      orderId: orderId,
      productId: 'a7b8c9d0-e1f2-4a1b-d5c6-678901234abc', // Κρουασάν
      quantity: 1,
      unitPrice: '2.00',
      totalPrice: '2.00',
      isTreat: false
    }
  ]).onConflictDoNothing();

  console.log('✅ Created order and sales');
}

async function createAppointments(staffId: string) {
  await db.insert(appointments).values([
    {
      id: 'c5b4a3f2-e1d0-4c3b-a2a1-123456789abc',
      whoBooked: 'Μαρία Παπαδοπούλου',
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000), // 2 days + 14 hours
      contactDetails: '6912345678',
      numChildren: 3,
      numAdults: 2,
      notes: 'Γενέθλια παιδιού',
      userId: staffId
    },
    {
      id: 'd4c3b2a1-f0e9-4d3c-b2b1-234567890abc',
      whoBooked: 'Γιώργος Δημητρίου',
      dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000), // 3 days + 16 hours
      contactDetails: '6923456789',
      numChildren: 5,
      numAdults: 3,
      notes: 'Σχολική εκδρομή',
      userId: staffId
    }
  ]).onConflictDoNothing();

  console.log('✅ Created appointments');
}

async function createFootballBookings(staffId: string) {
  await db.insert(footballFieldBookings).values([
    {
      id: 'e3d2c1b0-a9f8-4e3d-c2c1-345678901abc',
      whoBooked: 'Νίκος Αντωνίου',
      bookingDatetime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000), // 1 day + 18 hours
      contactDetails: '6934567890',
      fieldNumber: 1,
      numPlayers: 10,
      notes: 'Εβδομαδιαίο παιχνίδι',
      userId: staffId
    },
    {
      id: 'f2e1d0c9-b8a7-4f3e-d2d1-456789012abc',
      whoBooked: 'Κώστας Νικολάου',
      bookingDatetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000), // 2 days + 19 hours
      contactDetails: '6945678901',
      fieldNumber: 2,
      numPlayers: 8,
      notes: 'Φιλικό παιχνίδι',
      userId: staffId
    }
  ]).onConflictDoNothing();

  console.log('✅ Created football bookings');
}

async function seedDatabase() {
  try {
    console.log('⏳ Starting database seeding...');
    
    await clearDatabase();

    // Step 1: Create users sequentially as they are prerequisites for everything.
    console.log('  - Creating users...');
    const admin = await createUser('admin@clubos.com', 'Admin User', 'admin');
    const staff = await createUser('staff@clubos.com', 'Staff User', 'employee');
    const secretary = await createUser('secretary@clubos.com', 'Secretary User', 'secretary');
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

if (import.meta.main) {
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
};