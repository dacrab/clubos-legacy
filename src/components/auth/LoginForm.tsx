"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Eye, EyeOff, User } from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent } from "@/components/ui/card";

// Constants & Types
import { 
  API_ERROR_MESSAGES, 
  DIALOG_MESSAGES,
  VALIDATION,
  PASSWORD_MIN_LENGTH 
} from "@/lib/constants";
import { Database } from "@/types/supabase";
import { cn } from "@/lib/utils";
import { signInWithUsernameAndPassword, checkAndVerifySession } from "@/lib/auth-actions";

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

  const validateForm = () => {
    const isValid = formState.username.length >= VALIDATION.USERNAME_MIN_LENGTH &&
                   formState.password.length >= PASSWORD_MIN_LENGTH;
    if (!isValid) toast.error(API_ERROR_MESSAGES.INVALID_REQUEST);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormState(prev => ({ ...prev, loading: true }));

    const result = await signInWithUsernameAndPassword(supabase, formState.username, formState.password);

    if (result.success) {
      toast.success("Επιτυχής σύνδεση");
      await new Promise(resolve => setTimeout(resolve, 500));
      router.replace("/dashboard");
    } else {
      toast.error(result.message);
      setFormState(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const profile = await checkAndVerifySession(supabase);
      if (profile) {
        router.replace('/dashboard');
      } else {
        setIsInitializing(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN') router.replace('/dashboard');
        if (event === 'SIGNED_OUT') router.replace('/');
      }
    );

    return () => subscription.unsubscribe();
  }, [router, supabase]);

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
                onChange={(e) => setFormState(prev => ({ ...prev, username: e.target.value.trim() }))}
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
                onChange={(e) => setFormState(prev => ({ ...prev, password: e.target.value.trim() }))}
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
                  onClick={() => setFormState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
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