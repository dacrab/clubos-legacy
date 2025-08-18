'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut, UserIcon } from 'lucide-react';
import { toast } from 'sonner';

import { useStackApp } from '@/lib/auth-client';
import { PUBLIC_ROUTES } from '@/lib/constants';
import { logger } from '@/lib/utils/logger';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';

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

  const displayName =
    profile?.username || user?.primaryEmail?.split('@')[0] || user?.displayName || 'Χρήστης';

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
    <header className="bg-background flex h-12 items-center justify-between border-b px-3 sm:h-14">
      <span className="text-muted-foreground flex items-center gap-1 text-sm font-semibold capitalize sm:text-base">
        <UserIcon className="text-muted-foreground h-5 w-5" aria-label="User" />
        {displayName}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          disabled={isLoading}
          className="text-destructive h-8 px-2 text-sm sm:h-9 sm:text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="ml-1 hidden sm:inline">Αποσύνδεση...</span>
            </>
          ) : (
            <>
              <LogOut className="h-5 w-5" />
              <span className="ml-1 hidden sm:inline">Αποσύνδεση</span>
            </>
          )}
        </Button>
        <ModeToggle />
      </div>
    </header>
  );
}
