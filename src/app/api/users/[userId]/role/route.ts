import {
  checkAdminAccess,
  createApiClient,
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-utils';
import { ALLOWED_USER_ROLES } from '@/lib/constants';
import type { UserRole } from '@/types/supabase';

const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_FORBIDDEN = 403;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

// Params type removed to satisfy Next.js build checks

export async function PATCH(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;

    // Check admin access
    const adminAccess = await checkAdminAccess();
    if (!adminAccess) {
      return errorResponse('Unauthorized', HTTP_STATUS_FORBIDDEN);
    }

    // Parse request body
    const body: { role: UserRole } = await request.json();

    // Validate role
    const { role } = body;
    if (!(role && ALLOWED_USER_ROLES.includes(role))) {
      return errorResponse('Invalid role', HTTP_STATUS_BAD_REQUEST, {
        allowedRoles: ALLOWED_USER_ROLES,
        providedRole: role,
      });
    }

    // Update role using authenticated anon client; RLS ensures only admins can change roles
    const supabase = createApiClient();
    const { error: updateError } = await supabase.from('users').update({ role }).eq('id', userId);

    if (updateError) {
      return errorResponse('Failed to update role', HTTP_STATUS_INTERNAL_SERVER_ERROR, {
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
      return errorResponse('Failed to verify role update', HTTP_STATUS_INTERNAL_SERVER_ERROR, {
        details: verifyError?.message,
      });
    }

    return successResponse(updatedProfile, 'Role updated successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
