import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  
  if (session) {
    return redirect("/dashboard");
  }

  return <LoginForm />;
}
