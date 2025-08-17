import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create the connection
const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString, { max: 1 });

// Create the database instance
export const db = drizzle(sql, { schema });

export type Database = typeof db;
export { schema };
