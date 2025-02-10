'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Role } from '@/types';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  {
    title: 'Dashboard',
    href: (role: Role) => `/dashboard/${role}`,
    roles: ['admin', 'staff', 'secretary'] as Role[],
  },
  {
    title: 'Products',
    href: () => '/dashboard/products',
    roles: ['admin', 'staff'] as Role[],
  },
  {
    title: 'Sales', 
    href: () => '/dashboard/sales',
    roles: ['admin', 'staff'] as Role[],
  },
  {
    title: 'Register',
    href: () => '/dashboard/register', 
    roles: ['admin', 'staff'] as Role[],
  },
  {
    title: 'Appointments',
    href: () => '/dashboard/appointments',
    roles: ['secretary'] as Role[],
  },
  {
    title: 'Users',
    href: () => '/dashboard/users',
    roles: ['admin'] as Role[],
  },
] as const;

export const MainNav = () => {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<Role | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) return;

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (data) {
        setUserRole(data.role as Role);
      }
    };

    fetchUserRole();
  }, []);

  if (!userRole) return null;

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navItems
        .filter(item => item.roles.includes(userRole))
        .map(({ title, href }) => (
          <Link
            key={href(userRole)}
            href={href(userRole)}
            className={cn(
              'text-sm font-medium transition-colors hover:text-primary',
              pathname === href(userRole) ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {title}
          </Link>
        ))}
    </nav>
  );
};