"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Eye, EyeOff, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
// Constants & Types
import { 
  API_ERROR_MESSAGES, 
  DIALOG_MESSAGES,
  VALIDATION,
  PASSWORD_MIN_LENGTH 
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { type Database } from "@/types/supabase";

const VERIFICATION_FAILED_MSG = 'Profile verification failed';
const INVALID_CREDENTIALS_MSG = 'Λανθασμένο όνομα χρήστη ή κωδικός πρόσβασης';
const DASHBOARD_PATH = '/dashboard';

interface FormState {
  username: string;
  password: string;
  loading: boolean;
  showPassword: boolean;
}

const STYLES = {
  form: {
    container: "space-y-4",
    field: {
      container: "space-y-2",
      input: {
        base: "pr-10",
        withIcon: "pr-20"
      }
    }
  },
  loading: {
    container: "flex justify-center items-center min-h-[200px]"
  },
  icon: {
    container: "absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2",
    button: "h-6 px-2 text-muted-foreground hover:text-foreground",
    loading: "text-muted-foreground"
  }
} as const;

export default function LoginForm() {
  const [formState, setFormState] = useState<FormState>({
    username: "",
    password: "",
    loading: false,
    showPassword: false,
  });
  const [isInitializing, setIsInitializing] = useState(true);

  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const verifyUserProfile = useCallback(async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {throw new Error(VERIFICATION_FAILED_MSG);}
    return profile;
  }, [supabase]);

  const validateForm = () => {
    const isValid = formState.username.length >= VALIDATION.USERNAME_MIN_LENGTH &&
                   formState.password.length >= PASSWORD_MIN_LENGTH;
    if (!isValid) {toast.error(API_ERROR_MESSAGES.INVALID_REQUEST);}
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {return;}

    setFormState((prev: FormState) => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${formState.username.trim().toLowerCase()}@example.com`,
        password: formState.password,
      });

      if (error) {throw error;}

      const { data: _userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.session.user.id)
        .single();

      if (userError) {
        console.error('User error:', userError);
        throw userError;
      }

      try {
        await verifyUserProfile(data.session.user.id);
      } catch (verifyError) {
        console.error('Verification error:', verifyError);
        // Sign out the user if verification fails
        void supabase.auth.signOut();
        throw new Error(VERIFICATION_FAILED_MSG);
      }
      
      toast.success("Επιτυχής σύνδεση");
      
      // Add a small delay before redirecting to ensure session is established
      await new Promise(resolve => setTimeout(resolve, 500));
      router.replace(DASHBOARD_PATH);
    } catch (error) {
      console.error('Login error:', error);
      const message = error instanceof Error && error.message.includes('Invalid login credentials')
        ? INVALID_CREDENTIALS_MSG
        : API_ERROR_MESSAGES.SERVER_ERROR;
      toast.error(message);
    } finally {
      setFormState((prev: FormState) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {return;}
        await verifyUserProfile(user.id);
        router.replace(DASHBOARD_PATH);
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    void checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN') {router.replace(DASHBOARD_PATH);}
        if (event === 'SIGNED_OUT') {router.replace('/');}
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase, verifyUserProfile]);

  if (isInitializing) {
    return (
      <div className={STYLES.loading.container}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit} className={STYLES.form.container} method="POST">
          <div className={STYLES.form.field.container}>
            <Label htmlFor="username">Όνομα Χρήστη</Label>
            <div className="relative">
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Εισάγετε το όνομα χρήστη" 
                value={formState.username}
                onChange={(e) => setFormState((prev: FormState) => ({ ...prev, username: e.target.value.trim() }))}
                disabled={formState.loading}
                className={STYLES.form.field.input.base}
                required
                minLength={VALIDATION.USERNAME_MIN_LENGTH}
                maxLength={VALIDATION.USERNAME_MAX_LENGTH}
                autoComplete="username"
              />
              <div className={STYLES.icon.container}>
                {formState.loading ? (
                  <LoadingSpinner size="sm" className={STYLES.icon.loading} />
                ) : (
                  <User className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </div>

          <div className={STYLES.form.field.container}>
            <Label htmlFor="password">Κωδικός</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={formState.showPassword ? "text" : "password"}
                placeholder="Εισάγετε τον κωδικό σας"
                value={formState.password}
                onChange={(e) => setFormState((prev: FormState) => ({ ...prev, password: e.target.value.trim() }))}
                disabled={formState.loading}
                className={STYLES.form.field.input.withIcon}
                required
                minLength={PASSWORD_MIN_LENGTH}
                autoComplete="current-password"
              />
              <div className={STYLES.icon.container}>
                {formState.loading && (
                  <LoadingSpinner size="sm" className={STYLES.icon.loading} />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn("h-6 px-2", STYLES.icon.button)}
                  onClick={() => setFormState((prev: FormState) => ({ ...prev, showPassword: !prev.showPassword }))}
                  disabled={formState.loading}
                >
                  {formState.showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <LoadingButton 
            type="submit" 
            className="w-full" 
            loading={formState.loading}
            loadingText={DIALOG_MESSAGES.LOADING_TEXT_DEFAULT}
          >
            Σύνδεση
          </LoadingButton>
        </form>
      </CardContent>
    </Card>
  );
}