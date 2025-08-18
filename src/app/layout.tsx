import type { Metadata } from 'next';
import { StackProvider, StackTheme } from '@stackframe/stack';

import './globals.css';

import { stackServerApp } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'ClubOS',
  description: 'Club Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StackProvider app={stackServerApp}>
          <StackTheme>{children}</StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
