import { NextResponse } from 'next/server';
import { 
  API_ERROR_MESSAGES, 
  USER_MESSAGES, 
  DEFAULT_USER_ROLE, 
  ALLOWED_USER_ROLES 
} from '@/lib/constants';
import { 
  createAdminClient, 
  createApiClient, 
  checkAdminAccess, 
  errorResponse, 
  successResponse, 
  handleApiError 
} from '@/lib/api-utils';

export async function POST(request: Request) {
  try {
    const { email, password, username, role = DEFAULT_USER_ROLE } = await request.json();

    if (!email || !password || !username) {
      return errorResponse(API_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, 400);
    }

    if (!ALLOWED_USER_ROLES.includes(role)) {
      return errorResponse(API_ERROR_MESSAGES.INVALID_ROLE, 400);
    }

    // Use admin client for user creation
    const adminClient = createAdminClient();

    // Create user with admin client
    const { data, error: createUserError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, role }
    });

    if (createUserError || !data.user) {
      console.error('User creation error:', createUserError);
      return errorResponse(API_ERROR_MESSAGES.SERVER_ERROR, 400);
    }

    // Check if user already exists in public.users (created by trigger)
    const { data: existingUser } = await adminClient
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (existingUser) {
      // Update the existing user with the correct role instead of inserting
      const { error: updateError } = await adminClient
        .from('users')
        .update({
          username,
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', data.user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        await adminClient.auth.admin.deleteUser(data.user.id);
        return errorResponse(API_ERROR_MESSAGES.SERVER_ERROR, 400);
      }
    } else {
      // Create profile if it doesn't exist
      const { error: profileError } = await adminClient
        .from('users')
        .insert({
          id: data.user.id,
          username,
          role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        await adminClient.auth.admin.deleteUser(data.user.id);
        return errorResponse(API_ERROR_MESSAGES.SERVER_ERROR, 400);
      }
    }

    return successResponse(null, USER_MESSAGES.CREATE_SUCCESS);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const adminAccess = await checkAdminAccess();
    
    if (!adminAccess) {
      return errorResponse('Unauthorized', 403);
    }
    
    const supabase = await createApiClient();
    
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      return errorResponse('Error fetching users', 500, usersError);
    }

    return successResponse(users);
  } catch (error) {
    return handleApiError(error);
  }
}