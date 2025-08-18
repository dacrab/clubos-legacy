import { redirect } from 'next/navigation';

import { stackServerApp } from '@/lib/auth';
import { LoginForm } from '@/components/auth/LoginForm';

export default async function Home() {
  const user = await stackServerApp.getUser();

  if (user) {
    return redirect('/dashboard');
  }

  return <LoginForm />;
}
