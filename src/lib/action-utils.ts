/**
 * Utility functions for server actions
 */

import { createServerSupabase } from './supabase-server';

/**
 * Type for server action responses
 */
export type ActionResponse<T = unknown> = {
  success: boolean;
  message: string;
  data?: T | undefined;
};

/**
 * Generic error handler for server actions
 */
export function handleActionError(error: unknown, defaultMessage: string): ActionResponse<never> {
  return {
    success: false,
    message: error instanceof Error ? error.message : defaultMessage,
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
export function actionSuccess<T = unknown>(message: string, data?: T): ActionResponse<T> {
  return {
    success: true,
    message,
    data: data as T | undefined,
  };
}
