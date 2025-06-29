import { NextResponse } from 'next/server';
import { 
  API_ERROR_MESSAGES, 
  USER_MESSAGES, 
  DEFAULT_USER_ROLE, 
  ALLOWED_USER_ROLES 
} from '@/lib/constants';
import { createAdminClient } from '@/lib/supabase/admin';
import { 
  checkAdminAccess, 
  errorResponse, 
  successResponse, 
  handleApiError 
} from '@/lib/api-utils';

export async function POST(request: Request) {
  try {
    await checkAdminAccess();
    const { username, password, role = DEFAULT_USER_ROLE } = await request.json();
    const email = `${username.toLowerCase()}@example.com`; // Create a dummy email

    if (!password || !username) {
      return errorResponse(API_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, 400);
    }

    if (!ALLOWED_USER_ROLES.includes(role)) {
      return errorResponse(API_ERROR_MESSAGES.INVALID_ROLE, 400);
    }

    const adminClient = createAdminClient();
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm the dummy email
      user_metadata: { username, role }
    });

    if (error) {
      // Check for a more specific error, like user already exists
      if (error.message.includes('already exists')) {
        return errorResponse(USER_MESSAGES.USER_ALREADY_EXISTS, 409);
      }
      console.error('User creation error:', error);
      return errorResponse('Failed to create user.', 500, error);
    }
    
    // The database trigger (`create_public_user_on_signup`) will handle creating the user profile.
    // No need for additional logic here to insert/update the `public.users` table.

    return successResponse(data.user, USER_MESSAGES.CREATE_SUCCESS);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    await checkAdminAccess();
    const supabase = createAdminClient();
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      return errorResponse('Error fetching users', 500, error);
    }

    // Return data in the format expected by the useUsers hook
    return successResponse({ users });
  } catch (error) {
    return handleApiError(error);
  }
}