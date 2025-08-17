// User types based on Drizzle schema
export interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  role: 'admin' | 'staff' | 'user' | 'employee' | 'secretary';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInsert extends Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserUpdate = Partial<UserInsert>

// Re-export Stack Auth types for consistency
export type { UserProfile, StackUser, ExtendedUser } from './stack-auth';