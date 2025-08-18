#!/usr/bin/env bun
import { db } from '../src/lib/db';
import {
  appointments,
  categories,
  footballFieldBookings,
  orders,
  products,
  registerSessions,
  sales,
  users,
} from '../src/lib/db/schema';

interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'employee' | 'secretary';
}

interface RegisterSession {
  id: string;
}
async function resetDatabase(): Promise<void> {
  console.log('🗑️  Resetting database...');

  const tablesToClear = [
    sales,
    orders,
    appointments,
    footballFieldBookings,
    products,
    categories,
    registerSessions,
    users,
  ];

  for (const table of tablesToClear) {
    await db.delete(table);
  }

  console.log('✅ Database reset complete');
}

async function insertUser(
  email: string,
  username: string,
  role: 'admin' | 'employee' | 'secretary'
): Promise<User> {
  const user: User = {
    id: crypto.randomUUID(),
    email,
    username,
    role,
  };
  await db.insert(users).values(user).onConflictDoNothing();
  console.log(`👤 Created user: ${email} (${role})`);

  return user;
}

async function insertCategories(createdBy: string): Promise<void> {
  const mainCategoryId = crypto.randomUUID();

  await db
    .insert(categories)
    .values({
      id: mainCategoryId,
      name: 'Καφέδες',
      description: 'Όλα τα είδη καφέ',
      createdBy,
    })
    .onConflictDoNothing();

  const subcategories = [
    {
      id: crypto.randomUUID(),
      name: 'Ζεστοί Καφέδες',
      description: 'Ζεστοί καφέδες',
      parentId: mainCategoryId,
      createdBy,
    },
    {
      id: crypto.randomUUID(),
      name: 'Κρύοι Καφέδες',
      description: 'Κρύοι καφέδες',
      parentId: mainCategoryId,
      createdBy,
    },
    {
      id: crypto.randomUUID(),
      name: 'Ροφήματα',
      description: 'Διάφορα ροφήματα',
      createdBy,
    },
    {
      id: crypto.randomUUID(),
      name: 'Σνακ',
      description: 'Διάφορα σνακ',
      createdBy,
    },
  ];

  await db.insert(categories).values(subcategories).onConflictDoNothing();
  console.log('📂 Categories created');
}

async function insertProducts(createdBy: string): Promise<void> {
  const categoryResults = await db.select().from(categories);
  const hotCoffeeCategory = categoryResults.find(c => c.name === 'Ζεστοί Καφέδες');
  const coldCoffeeCategory = categoryResults.find(c => c.name === 'Κρύοι Καφέδες');
  const beverageCategory = categoryResults.find(c => c.name === 'Ροφήματα');
  const snackCategory = categoryResults.find(c => c.name === 'Σνακ');

  const productList = [
    {
      id: crypto.randomUUID(),
      name: 'Espresso',
      price: '2.00',
      stock: -1,
      categoryId: hotCoffeeCategory?.id,
      createdBy,
    },
    {
      id: crypto.randomUUID(),
      name: 'Cappuccino',
      price: '3.00',
      stock: -1,
      categoryId: hotCoffeeCategory?.id,
      createdBy,
    },
    {
      id: crypto.randomUUID(),
      name: 'Freddo Espresso',
      price: '3.00',
      stock: -1,
      categoryId: coldCoffeeCategory?.id,
      createdBy,
    },
    {
      id: crypto.randomUUID(),
      name: 'Freddo Cappuccino',
      price: '3.50',
      stock: -1,
      categoryId: coldCoffeeCategory?.id,
      createdBy,
    },
    {
      id: crypto.randomUUID(),
      name: 'Σοκολάτα',
      price: '3.50',
      stock: -1,
      categoryId: beverageCategory?.id,
      createdBy,
    },
    {
      id: crypto.randomUUID(),
      name: 'Τσάι',
      price: '2.50',
      stock: -1,
      categoryId: beverageCategory?.id,
      createdBy,
    },
    {
      id: crypto.randomUUID(),
      name: 'Κρουασάν',
      price: '2.00',
      stock: 20,
      categoryId: snackCategory?.id,
      createdBy,
    },
    {
      id: crypto.randomUUID(),
      name: 'Σάντουιτς',
      price: '3.50',
      stock: 15,
      categoryId: snackCategory?.id,
      createdBy,
    },
  ];

  await db.insert(products).values(productList).onConflictDoNothing();
  console.log('🛍️  Products created');
}

async function insertRegisterSession(): Promise<RegisterSession> {
  const session = {
    id: crypto.randomUUID(),
    openedBy: 'admin', // Required field for register sessions
  };

  await db.insert(registerSessions).values(session).onConflictDoNothing();
  console.log('💰 Register session created');

  return session as RegisterSession;
}

async function insertSampleOrder(staffId: string, sessionId: string): Promise<void> {
  const orderId = crypto.randomUUID();
  const productResults = await db.select().from(products);

  await db
    .insert(orders)
    .values({
      id: orderId,
      orderNumber: `ORDER-${Date.now()}`,
      registerSessionId: sessionId,
      totalAmount: '7.50',
      finalAmount: '3.50',
      cardDiscountCount: 1,
      createdBy: staffId,
    })
    .onConflictDoNothing();

  const sampleSales = [
    {
      id: crypto.randomUUID(),
      orderId,
      productId: productResults.find(p => p.name === 'Espresso')?.id || '',
      productName: 'Espresso',
      quantity: 1,
      unitPrice: '2.00',
      totalPrice: '2.00',
      isTreat: true,
    },
    {
      id: crypto.randomUUID(),
      orderId,
      productId: productResults.find(p => p.name === 'Σοκολάτα')?.id || '',
      productName: 'Σοκολάτα',
      quantity: 1,
      unitPrice: '3.50',
      totalPrice: '3.50',
      isTreat: false,
    },
    {
      id: crypto.randomUUID(),
      orderId,
      productId: productResults.find(p => p.name === 'Κρουασάν')?.id || '',
      productName: 'Κρουασάν',
      quantity: 1,
      unitPrice: '2.00',
      totalPrice: '2.00',
      isTreat: false,
    },
  ];

  await db.insert(sales).values(sampleSales).onConflictDoNothing();
  console.log('🧾 Sample order and sales created');
}

async function insertSampleAppointments(userId: string): Promise<void> {
  const sampleAppointments = [
    {
      id: crypto.randomUUID(),
      title: 'Γενέθλια παιδιού',
      whoBooked: 'Μαρία Παπαδοπούλου',
      dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
      contactDetails: '6912345678',
      numChildren: 3,
      numAdults: 2,
      notes: 'Γενέθλια παιδιού',
      userId,
    },
    {
      id: crypto.randomUUID(),
      title: 'Σχολική εκδρομή',
      whoBooked: 'Γιώργος Δημητρίου',
      dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
      contactDetails: '6923456789',
      numChildren: 5,
      numAdults: 3,
      notes: 'Σχολική εκδρομή',
      userId,
    },
  ];

  await db.insert(appointments).values(sampleAppointments).onConflictDoNothing();
  console.log('📅 Sample appointments created');
}

async function insertSampleFootballBookings(userId: string): Promise<void> {
  const sampleBookings = [
    {
      id: crypto.randomUUID(),
      whoBooked: 'Νίκος Αντωνίου',
      bookingDatetime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 18 * 60 * 60 * 1000),
      contactDetails: '6934567890',
      fieldNumber: 1,
      numPlayers: 10,
      notes: 'Εβδομαδιαίο παιχνίδι',
      userId,
    },
    {
      id: crypto.randomUUID(),
      whoBooked: 'Κώστας Νικολάου',
      bookingDatetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 19 * 60 * 60 * 1000),
      contactDetails: '6945678901',
      fieldNumber: 2,
      numPlayers: 8,
      notes: 'Φιλικό παιχνίδι',
      userId,
    },
  ];

  await db.insert(footballFieldBookings).values(sampleBookings).onConflictDoNothing();
  console.log('⚽ Sample football bookings created');
}

async function populateDatabase(): Promise<void> {
  try {
    console.log('🌱 Starting database population...');

    await resetDatabase();

    console.log('👥 Creating users...');
    const admin = await insertUser('vkavouras@proton.me', 'Admin User', 'admin');
    const employee = await insertUser('staff@clubos.com', 'Staff User', 'employee');
    const secretary = await insertUser('secretary@clubos.com', 'Secretary User', 'secretary');

    console.log('🏗️  Building catalog structure...');
    await insertCategories(admin.id);
    await insertProducts(admin.id);

    console.log('💼 Setting up operational data...');
    const session = await insertRegisterSession();
    await insertSampleOrder(employee.id, session.id);

    console.log('📋 Creating sample bookings...');
    await Promise.all([
      insertSampleAppointments(employee.id),
      insertSampleFootballBookings(employee.id),
    ]);

    console.log('🎉 Database population completed successfully!');
  } catch (error) {
    console.error('❌ Database population failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw error;
  }
}

if (import.meta.main) {
  populateDatabase().catch(error => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
}

export {
  populateDatabase,
  insertUser,
  insertCategories,
  insertProducts,
  insertRegisterSession,
  insertSampleOrder,
  insertSampleAppointments,
  insertSampleFootballBookings,
};
