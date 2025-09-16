'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { Loader2, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { CloseRegisterButton } from '@/components/dashboard/register/close-register-button';
import { ModeToggle } from '@/components/providers/mode-toggle';
import { Button } from '@/components/ui/button';
import { API_ERROR_MESSAGES, PUBLIC_ROUTES, type UserRole } from '@/lib/constants';
import { env } from '@/lib/env';
import type { Database } from '@/types/supabase';

type HeaderProps = {
  user: User;
  profile: {
    username: string | null;
    role: UserRole;
    id: string;
    created_at: string;
    [key: string]: unknown;
  };
};

export default function Header({ user, profile }: HeaderProps) {
  const router = useRouter();
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!(supabaseUrl && supabaseAnonKey)) {
    throw new Error('Missing Supabase URL or anonymous key');
  }
  const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  const [isLoading, setIsLoading] = useState(false);

  const displayName = profile.username || user.email?.split('@')[0] || 'User';

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      router.push(PUBLIC_ROUTES[0]);
      router.refresh();
    } catch (_error) {
      toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 h-[60px] border-b bg-background sm:h-[75px]"
      initial={{ y: -20, opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex h-full items-center justify-between px-2 xs:px-3 sm:px-8">
        {/* Left Section - Logo and Welcome Message */}
        <div className="flex items-center gap-1 xs:gap-2 sm:gap-6">
          <Image
            alt="Company Logo"
            className="h-[35px] xs:h-[40px] w-[35px] xs:w-[40px] object-contain sm:h-[50px] sm:w-[50px]"
            height={50}
            src="/logo.svg"
            width={50}
          />
          <div className="xs:flex hidden items-center gap-1 sm:gap-2">
            <span className="font-medium text-[10px] text-muted-foreground xs:text-xs sm:text-sm">
              Καλώς ήρθατε,
            </span>
            <span className="gradient-text font-semibold text-[10px] xs:text-xs capitalize sm:text-sm">
              {displayName}
            </span>
          </div>
        </div>

        {/* Right Section - Controls */}
        <div className="flex items-center gap-1 xs:gap-2 sm:gap-4">
          <Button
            className="group h-8 gap-1 px-1.5 xs:px-2 text-destructive text-xs transition-colors duration-200 hover:bg-destructive/10 focus:outline-hidden sm:h-9 sm:gap-2 sm:px-4 sm:text-sm"
            disabled={isLoading}
            onClick={handleSignOut}
            size="sm"
            variant="ghost"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Αποσύνδεση...</span>
              </>
            ) : (
              <>
                <LogOut className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Αποσύνδεση</span>
              </>
            )}
          </Button>

          <div className="lg:hidden">
            <CloseRegisterButton />
          </div>
          <ModeToggle />
        </div>
      </div>
    </motion.div>
  );
}
