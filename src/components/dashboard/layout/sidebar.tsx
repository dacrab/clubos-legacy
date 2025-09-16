'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils/format';

import { CloseRegisterButton } from '../register/close-register-button';

import { getVisibleNavItems, isUserAuthorized, type NavigationItem } from './navigation';

// Types
type SidebarProps = {
  role?: string;
};

// Main component
export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const canCloseRegister = isUserAuthorized(role);
  const visibleNavItems = getVisibleNavItems(role);

  // Render methods
  const renderNavItem = (item: NavigationItem, isActive: boolean) => {
    const Icon = item.icon;
    return (
      <Link
        className={cn(
          'group flex items-center gap-3 rounded-lg px-4 py-3 font-medium text-base transition-all duration-200',
          isActive
            ? '-translate-y-px bg-primary text-primary-foreground shadow-soft'
            : 'hover:-translate-y-px hover:bg-secondary/80 hover:shadow-soft'
        )}
        href={item.href}
        key={item.name}
      >
        <Icon
          className={cn(
            'h-5 w-5 transition-all duration-200 group-hover:scale-110',
            isActive && 'scale-110'
          )}
        />
        <span className="transition-transform group-hover:translate-x-0.5">{item.name}</span>
      </Link>
    );
  };

  return (
    <div className="glass-effect fixed inset-y-0 left-0 z-50 hidden w-72 border-r shadow-soft lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b p-6">
          <Link className="block" href="/dashboard">
            <h1 className="gradient-text font-bold text-2xl transition-transform hover:scale-[1.02]">
              Σύστημα Διαχείρισης
            </h1>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          <div className="mb-4 px-4 font-semibold text-muted-foreground text-sm uppercase tracking-wider">
            Μενού
          </div>
          {visibleNavItems.map((item) => renderNavItem(item, pathname === item.href))}
        </nav>

        {canCloseRegister && (
          <div className="border-t bg-secondary/50 p-4">
            <CloseRegisterButton />
          </div>
        )}
      </div>
    </div>
  );
}
