import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LoadingFallback } from "@/components/loading-fallback";
import { ErrorFallback } from "@/components/error-fallback";
import LoginForm from "@/components/auth/LoginForm";

export default async function Home() {
  const supabase = await createServerSupabase(false);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    return redirect("/dashboard");
  }

  return (
    <PageWrapper className="justify-center items-center">
      <div className="w-full max-w-lg">
        <ErrorBoundary fallback={<ErrorFallback />}>
          <Suspense fallback={<LoadingFallback />}>
            <LoginForm />
          </Suspense>
        </ErrorBoundary>
      </div>
    </PageWrapper>
  );
}
