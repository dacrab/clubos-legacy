'use client';

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { SignOutButtonProps } from "@/types/app";

export function SignOutButton({ variant = "ghost", size = "icon" }: SignOutButtonProps) {
  const router = useRouter();
  
  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error("Error", {
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  return (
    <Button
      onClick={handleSignOut}
      variant={variant}
      size={size}
      className="ml-2"
      aria-label="Sign out"
    >
      <LogOut className="h-5 w-4" />
      Log out
    </Button>
  );
} 