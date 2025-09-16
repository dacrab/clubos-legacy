import {
  checkAdminAccess,
  createAdminClient,
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-utils';

// Use Next.js route handler signature directly

const HTTP_STATUS_FORBIDDEN = 403;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

// Params type removed to satisfy Next.js build checks

export async function DELETE(_request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;

    const adminAccess = await checkAdminAccess();
    if (!adminAccess) {
      return errorResponse('Unauthorized', HTTP_STATUS_FORBIDDEN);
    }

    const admin = createAdminClient();

    // Delete the user from auth.users (this will cascade to public.users due to our trigger)
    const { error: deleteError } = await admin.auth.admin.deleteUser(userId);

    if (deleteError) {
      return errorResponse('Error deleting user', HTTP_STATUS_INTERNAL_SERVER_ERROR, deleteError);
    }

    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
