import { relations } from 'drizzle-orm';
import {
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

// Define enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'employee', 'secretary']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'treat']);
export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'cancelled',
  'completed',
]);

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  role: userRoleEnum('role').notNull().default('employee'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  parentId: uuid('parent_id'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  stock: integer('stock').notNull().default(0),
  minStockLevel: integer('min_stock_level').notNull().default(0),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  barcode: text('barcode').unique(),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').notNull().default(true),
  trackInventory: boolean('track_inventory').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Register sessions table
export const registerSessions = pgTable('register_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionName: text('session_name'),
  openedAt: timestamp('opened_at', { withTimezone: true }).notNull().defaultNow(),
  openedBy: text('opened_by')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  closedBy: text('closed_by').references(() => users.id, { onDelete: 'restrict' }),
  openingCash: decimal('opening_cash', { precision: 10, scale: 2 }).notNull().default('0'),
  closingCash: decimal('closing_cash', { precision: 10, scale: 2 }),
  expectedCash: decimal('expected_cash', { precision: 10, scale: 2 }),
  cashDifference: decimal('cash_difference', { precision: 10, scale: 2 }),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
});

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  registerSessionId: uuid('register_session_id')
    .notNull()
    .references(() => registerSessions.id, { onDelete: 'restrict' }),
  customerName: text('customer_name'),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull().default('0'),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  finalAmount: decimal('final_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  paymentMethod: paymentMethodEnum('payment_method').notNull().default('cash'),
  cardDiscountCount: integer('card_discount_count').notNull().default(0),
  isVoided: boolean('is_voided').notNull().default(false),
  voidReason: text('void_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: text('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'restrict' }),
  voidedAt: timestamp('voided_at', { withTimezone: true }),
  voidedBy: text('voided_by').references(() => users.id, { onDelete: 'restrict' }),
});

// Sales table (order items)
export const sales = pgTable('sales', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'restrict' }),
  productName: text('product_name').notNull(), // Snapshot for historical data
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  isTreat: boolean('is_treat').notNull().default(false),
  isVoided: boolean('is_voided').notNull().default(false),
  voidReason: text('void_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  voidedAt: timestamp('voided_at', { withTimezone: true }),
  voidedBy: text('voided_by').references(() => users.id, { onDelete: 'restrict' }),
});

// Appointments table
export const appointments = pgTable('appointments', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  whoBooked: text('who_booked').notNull(),
  contactDetails: text('contact_details'),
  contactEmail: text('contact_email'),
  dateTime: timestamp('date_time', { withTimezone: true }).notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(60),
  numChildren: integer('num_children').notNull().default(0),
  numAdults: integer('num_adults').notNull().default(0),
  status: bookingStatusEnum('status').notNull().default('pending'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  userId: text('user_id').references(() => users.id, { onDelete: 'restrict' }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Football field bookings table
export const footballFieldBookings = pgTable('football_field_bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  whoBooked: text('who_booked').notNull(),
  contactDetails: text('contact_details'),
  contactEmail: text('contact_email'),
  bookingDatetime: timestamp('booking_datetime', { withTimezone: true }).notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(90),
  fieldNumber: integer('field_number').notNull(),
  numPlayers: integer('num_players').notNull(),
  status: bookingStatusEnum('status').notNull().default('pending'),
  price: decimal('price', { precision: 10, scale: 2 }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  userId: text('user_id').references(() => users.id, { onDelete: 'restrict' }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  products: many(products),
  registerSessions: many(registerSessions),
  orders: many(orders),
  appointments: many(appointments),
  footballFieldBookings: many(footballFieldBookings),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
  products: many(products),
  createdBy: one(users, {
    fields: [categories.createdBy],
    references: [users.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  createdBy: one(users, {
    fields: [products.createdBy],
    references: [users.id],
  }),
  sales: many(sales),
}));

export const registerSessionsRelations = relations(registerSessions, ({ one, many }) => ({
  openedBy: one(users, {
    fields: [registerSessions.openedBy],
    references: [users.id],
  }),
  closedBy: one(users, {
    fields: [registerSessions.closedBy],
    references: [users.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  registerSession: one(registerSessions, {
    fields: [orders.registerSessionId],
    references: [registerSessions.id],
  }),
  createdBy: one(users, {
    fields: [orders.createdBy],
    references: [users.id],
  }),
  voidedBy: one(users, {
    fields: [orders.voidedBy],
    references: [users.id],
  }),
  sales: many(sales),
}));

export const salesRelations = relations(sales, ({ one }) => ({
  order: one(orders, {
    fields: [sales.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [sales.productId],
    references: [products.id],
  }),
  voidedBy: one(users, {
    fields: [sales.voidedBy],
    references: [users.id],
  }),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  user: one(users, {
    fields: [appointments.userId],
    references: [users.id],
  }),
}));

export const footballFieldBookingsRelations = relations(footballFieldBookings, ({ one }) => ({
  user: one(users, {
    fields: [footballFieldBookings.userId],
    references: [users.id],
  }),
}));
