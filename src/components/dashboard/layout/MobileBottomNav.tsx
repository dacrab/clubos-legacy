'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

import { getVisibleNavItems } from './navigation.config';

// Types
interface MobileSidebarProps {
  role?: string;
}

export default function MobileSidebar({ role }: MobileSidebarProps) {
  const pathname = usePathname();
  const visibleNavItems = getVisibleNavItems(role);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navRef.current) {
      const navHeight = navRef.current.offsetHeight;
      document.documentElement.style.setProperty('--mobile-nav-height', `${navHeight}px`);
    }
  }, []);

  return (
    <nav ref={navRef} className="flex w-full items-center justify-between px-2 py-2 sm:p-3">
      {visibleNavItems.map(item => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 rounded-lg p-2 transition-colors sm:gap-1.5 sm:p-3',
              isActive
                ? 'text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/80'
            )}
          >
            <div className={cn('relative', isActive && 'animate-bounce')}>
              <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>

            <span
              className={cn(
                'xs:text-[11px] line-clamp-1 text-center text-[10px] font-medium transition-all duration-200 sm:text-sm',
                isActive ? 'animate-fade-in' : 'opacity-70'
              )}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
