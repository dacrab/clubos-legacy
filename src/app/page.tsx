import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { LockKeyhole } from "lucide-react";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingFallback } from "@/components/loading-fallback";
import { ErrorFallback } from "@/components/error-fallback";
import LoginForm from "@/components/auth/LoginForm";
import { DIALOG_MESSAGES } from "@/lib/constants";

function Header() {
  return (
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
  );
}

export default async function Home() {
  const supabase = await createServerSupabase(false);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    return redirect("/dashboard");
  }

  return (
    <PageWrapper>
      <div className="container mx-auto">
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md">
            <ErrorBoundary fallback={<ErrorFallback />}>
              <Suspense fallback={<LoadingFallback />}>
                <LoginForm />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
