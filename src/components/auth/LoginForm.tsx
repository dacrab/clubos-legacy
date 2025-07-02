"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Eye, EyeOff, User, LockKeyhole } from "lucide-react";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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

const demoUsers = [
  {
    role: "Admin",
    username: "admin",
    password: "admin123",
  },
  {
    role: "Staff",
    username: "staff",
    password: "staff123",
  },
  {
    role: "Secretary",
    username: "secretary",
    password: "secretary123",
  },
];

function DemoCredentials() {
  return (
    <Card className="mt-4">
      <CardHeader className="p-4 border-b">
        <h2 className="text-lg font-semibold text-center">Demo Κωδικοί</h2>
      </CardHeader>
      <CardContent className="p-4 text-sm">
        <ul className="space-y-2">
          {demoUsers.map((user) => (
            <li key={user.role} className="flex justify-between items-baseline">
              <span className="font-bold">{user.role}</span>
              <div className="text-right">
                <p className="font-mono">{user.username}</p>
                <p className="font-mono text-muted-foreground">{user.password}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

interface FormState {
  username: string;
  password: string;
  loading: boolean;
  showPassword: boolean;
}

function Header() {
  return (
    <CardHeader>
      <div className="flex flex-col items-center gap-2">
        <div className="inline-block p-2 rounded-full bg-primary/10">
          <LockKeyhole className="h-5 w-5 text-primary" />
        </div>
        <h1 className="text-xl font-bold gradient-text">
          Σύστημα Διαχείρισης
        </h1>
        <p className="text-muted-foreground text-xs">
          Συνδεθείτε για να συνεχίσετε
        </p>
      </div>
    </CardHeader>
  );
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
    <div>
      <Card>
        <Header />
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
      <DemoCredentials />
    </div>
  );
}