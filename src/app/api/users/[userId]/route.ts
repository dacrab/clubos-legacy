import { type NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { 
  checkAdminAccess, 
} from '@/lib/api-utils';
import { ALLOWED_USER_ROLES, PASSWORD_MIN_LENGTH } from '@/lib/constants';

// GET a specific user
export async function GET(
  request: NextRequest
) {
  try {
    const userId = request.nextUrl.pathname.split('/').pop();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { data, error } = await createAdminClient()
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return new NextResponse('User not found', { status: 404 });
      }
      throw error;
    }
    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// DELETE a user
export async function DELETE(
  request: NextRequest
) {
  try {
    await checkAdminAccess();
    
    const userId = request.nextUrl.pathname.split('/').pop();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { error } = await createAdminClient().auth.admin.deleteUser(userId);
    if (error) throw error;
    
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// PATCH to update a user's role
export async function PATCH(
  request: NextRequest
) {
  try {
    await checkAdminAccess();

    const userId = request.nextUrl.pathname.split('/').pop();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { role } = await request.json();
    if (!role || !ALLOWED_USER_ROLES.includes(role)) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid role specified' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createAdminClient();
    
    const { data: user, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { app_metadata: { role } }
    );

    if (updateError) {
      throw updateError;
    }

    // Also update the public.users table
    const { error: publicUserError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (publicUserError) {
      // Log the error but don't block success if auth user was updated
      console.error('Error updating public.users table:', publicUserError);
    }
    
    return NextResponse.json(user);
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// POST to reset a user's password
export async function POST(
  request: NextRequest
) {
  try {
    await checkAdminAccess();

    const userId = request.nextUrl.pathname.split('/').pop();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { password } = await request.json();
    if (!password || password.length < PASSWORD_MIN_LENGTH) {
      return new NextResponse(
        JSON.stringify({ error: 'Password does not meet the minimum length requirement' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { data, error } = await createAdminClient().auth.admin.updateUserById(userId, { password });

    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}