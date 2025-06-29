import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { 
  checkAdminAccess, 
  errorResponse, 
  successResponse, 
  handleApiError
} from '@/lib/api-utils';
import { createServerSupabase } from '@/lib/supabase/server';
import { RouteHandler } from '@/types/next-auth';
import { ALLOWED_USER_ROLES, PASSWORD_MIN_LENGTH, USER_MESSAGES } from '@/lib/constants';

type Params = {
  userId: string;
};

// --- DELETE Handler ---
export const DELETE: RouteHandler<Params> = async (req, { params }) => {
  try {
    const { userId } = await params;
    await checkAdminAccess();
    
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(userId);

    if (error) {
      return errorResponse('Error deleting user', 500, error);
    }
    return successResponse(null, USER_MESSAGES.DELETE_SUCCESS);
  } catch (error) {
    return handleApiError(error);
  }
};

// --- PATCH Handler (for role update) ---
export const PATCH: RouteHandler<Params> = async (req, { params }) => {
  try {
    const { userId } = await params;
    await checkAdminAccess();

    const { role } = await req.json();
    if (!role || !ALLOWED_USER_ROLES.includes(role)) {
      return errorResponse('Invalid role specified', 400);
    }

    const supabase = await createServerSupabase();
    const { error } = await supabase.from('users').update({ role }).eq('id', userId);

    if (error) {
      return errorResponse('Failed to update user role', 500, error);
    }
    return successResponse(null, 'User role updated successfully.');
  } catch (error) {
    return handleApiError(error);
  }
};

// --- POST Handler (for password reset) ---
export const POST: RouteHandler<Params> = async (req, { params }) => {
  try {
    const { userId } = await params;
    await checkAdminAccess();

    const { password } = await req.json();
    if (!password || password.length < PASSWORD_MIN_LENGTH) {
      return errorResponse('Password does not meet the minimum length requirement', 400);
    }

    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.updateUserById(userId, { password });

    if (error) {
      return errorResponse('Failed to reset password', 500, error);
    }
    return successResponse(null, USER_MESSAGES.PASSWORD_RESET_SUCCESS);
  } catch (error) {
    return handleApiError(error);
  }
};