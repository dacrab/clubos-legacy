import { type NextRequest } from 'next/server';

import {
  createAdminClient,
  errorResponse,
  successResponse,
  handleApiError
} from '@/lib/api-utils';
import { 
  PASSWORD_MIN_LENGTH, 
  USER_MESSAGES,
  API_ERROR_MESSAGES
} from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Password validation
    const { password } = await request.json();
    if (!password || password.length < PASSWORD_MIN_LENGTH) {
      return errorResponse(API_ERROR_MESSAGES.INVALID_REQUEST, 400);
    }

    // Update password using admin client
    const adminClient = createAdminClient();
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      userId,
      { password }
    );

    if (updateError) {
      return errorResponse(API_ERROR_MESSAGES.SERVER_ERROR, 500, updateError);
    }

    return successResponse(null, USER_MESSAGES.PASSWORD_RESET_SUCCESS);
  } catch (error) {
    return handleApiError(error);
  }
}