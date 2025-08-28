import { NextRequest, NextResponse } from 'next/server';
import { ALLOWED_USER_ROLES } from '@/lib/constants';
import {
  checkAdminAccess,
  createApiClient,
  errorResponse,
  successResponse,
  handleApiError
} from '@/lib/api-utils';
import { RouteHandler } from '@/types/route';

type Params = {
  userId: string;
};

export const PATCH: RouteHandler<Params> = async (
  request: NextRequest,
  { params }
) => {
  try {
    const { userId } = await params;
    console.log('=== Starting role update request ===');
    console.log('Request params:', { userId });

    // Check admin access
    const adminAccess = await checkAdminAccess();
    if (!adminAccess) {
      return errorResponse('Unauthorized', 403);
    }

    // Parse request body
    const body = await request.json();
    console.log('Request body:', body);

    // Validate role
    const { role } = body;
    if (!role || !ALLOWED_USER_ROLES.includes(role)) {
      console.error('Invalid role provided:', role);
      return errorResponse('Invalid role', 400, {
        allowedRoles: ALLOWED_USER_ROLES,
        providedRole: role,
      });
    }

    // Update the user's role
    const supabase = await createApiClient();
    console.log('Attempting role update:', { userId, newRole: role });
    const { error: updateError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);

    if (updateError) {
      console.error('Role update failed:', updateError);
      return errorResponse('Failed to update role', 500, {
        details: updateError.message,
        code: updateError.code,
      });
    }

    // Verify update
    const { data: updatedProfile, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (verifyError || !updatedProfile) {
      console.error('Failed to verify update:', { verifyError, updatedProfile });
      return errorResponse('Failed to verify role update', 500, {
        details: verifyError?.message,
      });
    }

    console.log('Role update successful:', {
      userId: updatedProfile.id,
      newRole: updatedProfile.role,
    });

    return successResponse(updatedProfile, 'Role updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}; 