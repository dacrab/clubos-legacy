"use client";

import { useEffect, useState } from "react";
import { createClientSupabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { transitions } from "@/lib/animations";
import { LoadingAnimation } from "@/components/ui/loading-animation";
import { ALLOWED_USER_ROLES, UserRole } from "@/lib/constants";
import AddUserButton from "@/components/dashboard/users/AddUserButton";
import UsersTable from "@/components/dashboard/users/UsersTable";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type User = {
  id: string;
  username: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const supabase = createClientSupabase();

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    
    const handleResize = () => {
      checkMobile();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return router.push('/');

      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userDataError || !userData?.role) return router.push('/');
      if (userData.role !== ALLOWED_USER_ROLES[0]) return router.push('/dashboard');

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username, role, created_at, updated_at')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      setUsers(usersData || []);
    };

    fetchData()
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [router, supabase]);

  if (isLoading) return <LoadingAnimation />;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitions.smooth}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Χρήστες</h1>
            <p className="text-muted-foreground">
              Διαχείριση χρηστών και δικαιωμάτων πρόσβασης
            </p>
          </div>
          <AddUserButton />
        </div>
      </motion.div>


      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, ...transitions.smooth }}
        className="w-full"
      >
        <Card className={cn(
          isMobile ? "border-0 p-0 shadow-none bg-transparent" : "p-0"
        )}>
          <UsersTable users={users} />
        </Card>
      </motion.div>
    </div>
  );
}