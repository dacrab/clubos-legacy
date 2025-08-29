import { LockKeyhole } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import LoginForm from "@/components/auth/LoginForm";
import { DIALOG_MESSAGES } from "@/lib/constants";
import { createServerSupabase } from "@/lib/supabase-server";

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
      <Image
        src="/logo.svg"
        alt="Logo"
        width={50}
        height={60}
        priority
        className="mx-auto"
        style={{ width: 'auto', height: '60px' }}
      />
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
        <p>Copyright {new Date().getFullYear()} clubOS - Powered By dacrab</p>
      </div>
    </div>
  );
}

export default async function Home() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    return redirect("/dashboard");
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background">
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
