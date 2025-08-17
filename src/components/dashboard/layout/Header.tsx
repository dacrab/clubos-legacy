"use client";

import { LogOut, Loader2, UserIcon} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { logger } from "@/lib/utils/logger";
import { toast } from "sonner";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useStackApp } from "@/lib/auth-client";
import { PUBLIC_ROUTES } from "@/lib/constants";



// Minimal HeaderProps  
interface HeaderProps {
  user: { primaryEmail?: string | null; displayName?: string | null };
  profile: {
    username: string | null;
  };
}

export default function Header({ user, profile }: HeaderProps) {
  const router = useRouter();
  const stackApp = useStackApp();
  const [isLoading, setIsLoading] = useState(false);

  const displayName = profile?.username || user?.primaryEmail?.split('@')[0] || user?.displayName || 'Χρήστης';

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const currentUser = await stackApp.getUser();
      if (currentUser) {
        await currentUser.signOut();
      }
      router.push(PUBLIC_ROUTES[0]);
      router.refresh();
    } catch (error) {
      toast.error('Αποτυχία αποσύνδεσης');
      logger.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
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