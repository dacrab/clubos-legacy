import {
  checkAdminAccess,
  createApiClient,
  errorResponse,
  handleApiError,
  successResponse,
} from '@/lib/api-utils';
// no service role usage
import {
  ALLOWED_USER_ROLES,
  API_ERROR_MESSAGES,
  DEFAULT_USER_ROLE,
  USER_MESSAGES,
} from '@/lib/constants';

const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_FORBIDDEN = 403;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

export async function POST(request: Request) {
  try {
    // Require admin
    const adminAccess = await checkAdminAccess();
    if (!adminAccess) {
      return errorResponse('Unauthorized', HTTP_STATUS_FORBIDDEN);
    }

    const { email, password, username, role = DEFAULT_USER_ROLE } = await request.json();

    if (!(email && password && username)) {
      return errorResponse(API_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, HTTP_STATUS_BAD_REQUEST);
    }

    if (!ALLOWED_USER_ROLES.includes(role)) {
      return errorResponse(API_ERROR_MESSAGES.INVALID_ROLE, HTTP_STATUS_BAD_REQUEST);
    }

    // Delegate to Supabase Edge Function which holds service role securely
    const supabase = createApiClient();
    const { error: fnError } = await supabase.functions.invoke('admin-create-user', {
      body: { email, password, username, role },
    });

    if (fnError) {
      return errorResponse(API_ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS_BAD_REQUEST, fnError);
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
      return errorResponse('Unauthorized', HTTP_STATUS_FORBIDDEN);
    }

    const supabase = await createApiClient();

    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) {
      return errorResponse('Error fetching users', HTTP_STATUS_INTERNAL_SERVER_ERROR, usersError);
    }

    return successResponse(users);
  } catch (error) {
    return handleApiError(error);
  }
}
