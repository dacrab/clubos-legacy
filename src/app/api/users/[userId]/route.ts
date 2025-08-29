import { type NextRequest } from 'next/server';

import { 
  checkAdminAccess,
  createApiClient,
  errorResponse,
  successResponse,
  handleApiError
} from '@/lib/api-utils';
import { type RouteHandler } from '@/types/route';

type Params = {
  userId: string;
};

export const DELETE: RouteHandler<Params> = async (
  request: NextRequest,
  { params }
) => {
  try {
    const { userId } = await params;
    
    const adminAccess = await checkAdminAccess();
    if (!adminAccess) {
      return errorResponse('Unauthorized', 403);
    }
    
    const supabase = await createApiClient();

    // Delete the user from auth.users (this will cascade to public.users due to our trigger)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      userId
    );

    if (deleteError) {
      return errorResponse('Error deleting user', 500, deleteError);
    }

    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    return handleApiError(error);
  }
};