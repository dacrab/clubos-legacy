import { stackServerApp } from '@/lib/auth';
import { getUserById } from '@/lib/db/services/users';

export enum UserRole {
  Admin = 'admin',
  Staff = 'staff',
  User = 'user',
}

/**
 * Get the authenticated user
 */
export async function getAuthUser() {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error('Μη εξουσιοδοτημένος χρήστης');
  }
  return user;
}

/**
 * Check if the current user is an admin
 */
export async function checkAdminAccess() {
  const user = await getAuthUser();

  // Get user details from database to check role
  const userDetails = await getUserById(user.id);
  if (!userDetails) {
    throw new Error('Ο χρήστης δεν βρέθηκε στη βάση δεδομένων');
  }

  if (userDetails.role !== 'admin') {
    throw new Error('Απαιτείται δικαίωμα διαχειριστή');
  }

  return true;
}

/**
 * Check if the current user has the specified role
 */
export async function checkUserRole(requiredRole: 'admin' | 'employee' | 'secretary') {
  const user = await getAuthUser();

  // Get user details from database to check role
  const userDetails = await getUserById(user.id);
  if (!userDetails) {
    throw new Error('Ο χρήστης δεν βρέθηκε στη βάση δεδομένων');
  }

  if (userDetails.role !== requiredRole) {
    throw new Error(`Απαιτείται δικαίωμα ${requiredRole}`);
  }

  return true;
}

/**
 * Get user role from database
 */
export async function getUserRole(): Promise<'admin' | 'employee' | 'secretary'> {
  const user = await getAuthUser();

  const userDetails = await getUserById(user.id);
  if (!userDetails) {
    throw new Error('Ο χρήστης δεν βρέθηκε στη βάση δεδομένων');
  }

  return userDetails.role;
}

/**
 * Action response type
 */
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Create a successful action response
 */
export function actionSuccess<T>(data?: T): ActionResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Handle action errors consistently
 */
export function handleActionError(error: unknown): ActionResponse {
  const message = error instanceof Error ? error.message : 'Απρόσμενο σφάλμα';
  return {
    success: false,
    error: message,
  };
}

/**
 * Extract and validate form data from FormData
 */
export function extractFormData<T>(formData: FormData, fields: (keyof T)[]): Partial<T> {
  const result: Partial<T> = {};

  for (const field of fields) {
    const value = formData.get(field as string);
    if (value !== null) {
      result[field] = value as T[keyof T];
    }
  }

  return result;
}
