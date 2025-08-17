import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/LoginForm";
import { stackServerApp } from "@/lib/auth";

export default async function Home() {
  const user = await stackServerApp.getUser();
  
  if (user) {
    return redirect("/dashboard");
  }

  return <LoginForm />;
}
