import {
  checkAdminAccess,
  createApiClient,
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/utils/api-utils';

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

    const supabase = createApiClient();
    // Invoke Edge Function to delete the user in auth; ON DELETE CASCADE cleans up public.users
    const { error: deleteError } = await supabase.functions.invoke('admin-delete-user', {
      body: { userId },
    });

    if (deleteError) {
      return errorResponse('Error deleting user', HTTP_STATUS_INTERNAL_SERVER_ERROR, deleteError);
    }

    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
