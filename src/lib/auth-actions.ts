import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { toast } from 'sonner';

type SupabaseClientType = SupabaseClient<Database>;

async function verifyUserProfile(supabase: SupabaseClientType, userId: string) {
    const { data: profile, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !profile) {
        await supabase.auth.signOut();
        throw new Error('Αποτυχία επαλήθευσης προφίλ');
    }
    return profile;
}

export async function checkAndVerifySession(supabase: SupabaseClientType) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        return await verifyUserProfile(supabase, user.id);
    } catch (error) {
        console.error('Σφάλμα ελέγχου συνεδρίας:', error);
        return null;
    }
}

export async function signInWithUsernameAndPassword(supabase: SupabaseClientType, username: string, password: string) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: `${username.trim().toLowerCase()}@example.com`,
            password: password,
        });

        if (error || !data?.session) {
            throw error || new Error('Δεν υπάρχει συνεδρία');
        }
        
        await verifyUserProfile(supabase, data.session.user.id);
        
        return { success: true };

    } catch (error) {
        console.error('Σφάλμα σύνδεσης:', error);
        const message = error instanceof Error && error.message.includes('Invalid login credentials')
            ? 'Λανθασμένο όνομα χρήστη ή κωδικός πρόσβασης'
            : 'Παρουσιάστηκε σφάλμα κατά τη σύνδεση.';
        return { success: false, message };
    }
}

export async function signOut(supabase: SupabaseClientType) {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Σφάλμα αποσύνδεσης:', error);
    toast.error('Αποτυχία αποσύνδεσης');
    return { success: false };
  }
} 