"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from '@supabase/supabase-js';
import { createBrowserClient } from "@supabase/ssr";
import { LogOut, Loader2, UserIcon} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import type { Database } from "@/types/supabase";
import { PUBLIC_ROUTES } from "@/lib/constants";
import { signOut } from "@/lib/auth-actions";
import { toast } from "sonner";

// Minimal HeaderProps
interface HeaderProps {
  user: User;
  profile: {
    username: string | null;
  };
}

export default function Header({ user, profile }: HeaderProps) {
  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [isLoading, setIsLoading] = useState(false);

  const displayName = profile?.username || user?.email?.split('@')[0] || 'Χρήστης';

  const handleSignOut = async () => {
    setIsLoading(true);
    const { success } = await signOut(supabase);
    if (success) {
      router.push(PUBLIC_ROUTES[0]);
      router.refresh();
    }
    setIsLoading(false);
  };

  return (
    <header className="border-b h-12 sm:h-14 bg-background flex items-center justify-between px-3">
      <span className="flex items-center gap-1 text-sm sm:text-base font-semibold text-muted-foreground capitalize">
        <UserIcon className="h-5 w-5 text-muted-foreground" aria-label="User" />
        {displayName}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          disabled={isLoading}
          className="h-8 sm:h-9 px-2 text-destructive text-sm sm:text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="hidden sm:inline ml-1">Αποσύνδεση...</span>
            </>
          ) : (
            <>
              <LogOut className="h-5 w-5" />
              <span className="hidden sm:inline ml-1">Αποσύνδεση</span>
            </>
          )}
        </Button>
        <ModeToggle />
      </div>
    </header>
  );
}