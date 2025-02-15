'use client';

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const UserNav = () => {
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
      variant="ghost"
      className="h-8"
    >
      Log out
    </Button>
  );
}; 