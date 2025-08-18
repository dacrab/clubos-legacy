import type { Metadata } from 'next';
import { StackProvider, StackTheme } from '@stackframe/stack';

import './globals.css';

import { stackServerApp } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'ClubOS',
  description: 'Club Management System',
};

// Check if Stack Auth is configured
const hasStackAuthConfig = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {hasStackAuthConfig ? (
          <StackProvider app={stackServerApp}>
            <StackTheme>{children}</StackTheme>
          </StackProvider>
        ) : (
          // Fallback for when Stack Auth is not configured (CI builds)
          <div>{children}</div>
        )}
      </body>
    </html>
  );
}
