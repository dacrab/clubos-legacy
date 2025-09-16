// Route handler uses web Request and untyped context to satisfy Next's checks

import { createAdminClient, errorResponse, handleApiError, successResponse } from '@/lib/api-utils';
import { API_ERROR_MESSAGES, PASSWORD_MIN_LENGTH, USER_MESSAGES } from '@/lib/constants';

const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

export const dynamic = 'force-dynamic';

export async function POST(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await context.params;

    // Password validation
    const { password } = await request.json();
    if (!password || password.length < PASSWORD_MIN_LENGTH) {
      return errorResponse(API_ERROR_MESSAGES.INVALID_REQUEST, HTTP_STATUS_BAD_REQUEST);
    }

    // Update password using admin client
    const adminClient = createAdminClient();
    const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
      password,
    });

    if (updateError) {
      return errorResponse(
        API_ERROR_MESSAGES.SERVER_ERROR,
        HTTP_STATUS_INTERNAL_SERVER_ERROR,
        updateError
      );
    }

    return successResponse(null, USER_MESSAGES.PASSWORD_RESET_SUCCESS);
  } catch (error) {
    return handleApiError(error);
  }
}
