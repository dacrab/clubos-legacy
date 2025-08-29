import { type NextRequest } from 'next/server';

import {
  checkAdminAccess,
  createApiClient,
  errorResponse,
  successResponse,
  handleApiError
} from '@/lib/api-utils';
import { ALLOWED_USER_ROLES } from '@/lib/constants';
import { type RouteHandler } from '@/types/route';

type Params = {
  userId: string;
};

export const PATCH: RouteHandler<Params> = async (
  request: NextRequest,
  { params }
) => {
  try {
    const { userId } = await params;

    // Check admin access
    const adminAccess = await checkAdminAccess();
    if (!adminAccess) {
      return errorResponse('Unauthorized', 403);
    }

    // Parse request body
    const body = await request.json();

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
    const supabase = await createApiClient() as any;
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

    return successResponse(updatedProfile, 'Role updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}; 