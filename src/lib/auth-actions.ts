'use server';

import { stackServerApp } from '@/lib/auth';
import { logger } from '@/lib/utils/logger';
import { getUserById } from '@/lib/db/services/users';

export async function signOut() {
  try {
    // Stack Auth handles sign out through its URLs
    return { success: true };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Σφάλμα αποσύνδεσης:', error);
    }
    return { success: false };
  }
}

export async function verifyUserProfile(userId: string) {
  try {
    const userDetails = await getUserById(userId);
    if (!userDetails) {
      return { success: false, error: 'Ο χρήστης δεν βρέθηκε' };
    }
    
    return { success: true, data: userDetails };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      logger.error('Error verifying user profile:', error);
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Σφάλμα επαλήθευσης προφίλ' 
    };
  }
}

export async function getCurrentUser() {
  return await stackServerApp.getUser();
} 