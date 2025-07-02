import { NextResponse } from 'next/server';
import { 
  API_ERROR_MESSAGES, 
  USER_MESSAGES, 
  DEFAULT_USER_ROLE, 
  ALLOWED_USER_ROLES 
} from '@/lib/constants';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Λείπει το Supabase URL ή το service key');
}
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  try {
    const { username, password, role = DEFAULT_USER_ROLE } = await request.json();

    if (!password || !username) {
      return new NextResponse(API_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, { status: 400 });
    }

    if (!ALLOWED_USER_ROLES.includes(role)) {
      return new NextResponse(API_ERROR_MESSAGES.INVALID_ROLE, { status: 400 });
    }

    const email = `${username.toLowerCase().replace(/\s+/g, '_')}@example.com`;

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username, role }
    });

    if (error) {
      if (error.message.includes('already exists')) {
        return new NextResponse(USER_MESSAGES.USER_ALREADY_EXISTS, { status: 409 });
      }
      return new NextResponse(`Αποτυχία δημιουργίας χρήστη: ${error.message}`, { status: 500 });
    }
    
    return NextResponse.json(data.user);
  } catch (error: any) {
    return new NextResponse(`Εσωτερικό σφάλμα διακομιστή: ${error.message}`, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data: users, error } = await createAdminClient()
      .from('users')
      .select('id, username, role, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      return new NextResponse(
        JSON.stringify({ error: `Σφάλμα κατά την ανάκτηση χρηστών: ${error.message}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return NextResponse.json({ users });
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: `Εσωτερικό σφάλμα διακομιστή: ${error.message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}