"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { User } from '@supabase/supabase-js';
import { createBrowserClient } from "@supabase/ssr";
import { LogOut, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { CloseRegisterButton } from "@/components/dashboard/register/CloseRegisterButton";
import type { Database } from "@/types/supabase";
import { UserRole } from "@/lib/constants";

// UI Components
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";

// Constants
import { 
  PUBLIC_ROUTES, 
  ROLE_TRANSLATIONS, 
  API_ERROR_MESSAGES 
} from "@/lib/constants";

// Types
interface HeaderProps {
  user: User;
  profile: {
    username: string | null;
    role: UserRole;
    id: string;
    created_at: string;
    [key: string]: any;
  };
}

export default function Header({ user, profile }: HeaderProps) {
  const router = useRouter();
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [isLoading, setIsLoading] = useState(false);

  const roleLabel = ROLE_TRANSLATIONS[profile?.role] || ROLE_TRANSLATIONS.employee;
  const displayName = profile?.username || user?.email?.split('@')[0] || 'User';

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      router.push(PUBLIC_ROUTES[0]);
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error(API_ERROR_MESSAGES.SERVER_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-40 border-b h-[60px] sm:h-[75px] bg-background"
    >
      <div className="flex h-full items-center justify-between px-2 xs:px-3 sm:px-8">
        {/* Left Section - Logo and Welcome Message */}
        <div className="flex items-center gap-1 xs:gap-2 sm:gap-6">
          <Image
            src="/logo.png"
            width={50}
            height={50}
            alt="Company Logo"
            className="w-[35px] h-[35px] xs:w-[40px] xs:h-[40px] sm:w-[50px] sm:h-[50px] object-contain"
          />
          <div className="hidden xs:flex items-center gap-1 sm:gap-2">
            <span className="text-[10px] xs:text-xs sm:text-sm font-medium text-muted-foreground">
              Καλώς ήρθατε,
            </span>
            <span className="text-[10px] xs:text-xs sm:text-sm font-semibold gradient-text capitalize">
              {displayName}
            </span>
          </div>
        </div>
        
        {/* Right Section - Controls */}
        <div className="flex items-center gap-1 xs:gap-2 sm:gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleSignOut}
            disabled={isLoading}
            className="h-8 sm:h-9 gap-1 sm:gap-2 px-1.5 xs:px-2 sm:px-4 hover:bg-destructive/10 group transition-colors duration-200 focus:outline-none text-destructive text-xs sm:text-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
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