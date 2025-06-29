/**
 * Utility functions for server actions
 */

import { createServerSupabase } from './supabase/server';

/**
 * Type for server action responses
 */
export type ActionResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
};

/**
 * Generic error handler for server actions
 */
export async function handleActionError(
  error: unknown,
  defaultMessage: string
): Promise<ActionResponse> {
  console.error('Action error:', error);
  return {
    success: false,
    message: error instanceof Error ? error.message : defaultMessage
  };
}

/**
 * Creates a Supabase client configured for server actions
 */
export async function getActionSupabase() {
  return await createServerSupabase();
}

/**
 * Creates a successful action response
 */
export function actionSuccess<T = any>(message: string, data?: T): ActionResponse<T> {
  return {
    success: true,
    message,
    data
  };
} 