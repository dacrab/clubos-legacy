import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { LockKeyhole } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import { Suspense } from "react";
import { DIALOG_MESSAGES } from "@/lib/constants";

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-muted-foreground">{DIALOG_MESSAGES.LOADING_TEXT_DEFAULT}</div>
    </div>
  );
}

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

function Footer() {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-center text-xs text-muted-foreground">
        <p>Σε περίπτωση προβλήματος, επικοινωνήστε με τον διαχειριστή</p>
      </div>
      <div className="text-center text-xs text-muted-foreground/60">
        <p>
          &copy; {new Date().getFullYear()} Designed & Developed by <a href="https://dacrab.github.io" target="_blank" rel="noopener noreferrer" className="text-primary">DaCrab</a>
        </p>
      </div>
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
    <div className="fixed inset-0 flex items-center justify-center bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="w-full max-w-sm mx-auto px-3">
        <div className="p-3 sm:p-4 bg-card rounded-xl border shadow-soft hover:shadow-soft-hover flex flex-col gap-3 sm:gap-4 transition-all duration-300">
          <Header />
          <Suspense fallback={<LoadingFallback />}>
            <LoginForm />
          </Suspense>
          <Footer />
        </div>
      </div>
    </div>
  );
}
