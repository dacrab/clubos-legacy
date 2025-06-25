"use client";

// External Dependencies
import type { User } from '@supabase/supabase-js';
import { Sale } from "@/types/sales";
import { UserRole } from "@/lib/constants";

// Internal Components
import Header from "./Header";

// Types
interface EmployeeLayoutProps {
  children: React.ReactNode;
  user: User;
  profile: {
    username: string | null;
    role: UserRole;
    id: string;
    created_at: string;
    [key: string]: any;
  };
  recentSales: Sale[];
}

export default function EmployeeLayout({ user, profile, children, recentSales }: EmployeeLayoutProps) {
  return (
    <div className="flex flex-col flex-1 bg-gradient-to-b from-background to-secondary/10">
      <Header user={user} profile={profile} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
