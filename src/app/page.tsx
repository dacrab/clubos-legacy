import { LockKeyhole } from 'lucide-react';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import LoginForm from '@/components/auth/login-form';
import { DIALOG_MESSAGES } from '@/lib/constants';
import { createServerSupabase } from '@/lib/supabase-server';

function LoadingFallback() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <div className="text-muted-foreground">{DIALOG_MESSAGES.LOADING_TEXT_DEFAULT}</div>
    </div>
  );
}

function Header() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="inline-block rounded-full bg-primary/10 p-2">
        <LockKeyhole className="h-5 w-5 text-primary" />
      </div>
      <Image
        alt="Logo"
        className="mx-auto"
        height={60}
        priority
        src="/logo.svg"
        style={{ width: 'auto', height: '60px' }}
        width={50}
      />
      <h1 className="gradient-text font-bold text-xl">Σύστημα Διαχείρισης</h1>
      <p className="text-muted-foreground text-xs">Συνδεθείτε για να συνεχίσετε</p>
    </div>
  );
}

function Footer() {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-center text-muted-foreground text-xs">
        <p>Σε περίπτωση προβλήματος, επικοινωνήστε με τον διαχειριστή</p>
      </div>
      <div className="text-center text-muted-foreground/60 text-xs">
        <p>Copyright {new Date().getFullYear()} clubOS - Powered By dacrab</p>
      </div>
    </div>
  );
}

export default async function Home() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return redirect('/dashboard');
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] bg-background from-primary/10 via-background to-background">
      <div className="mx-auto w-full max-w-sm px-3">
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-soft transition-all duration-300 hover:shadow-soft-hover sm:gap-4 sm:p-4">
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
