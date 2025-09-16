import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Toaster } from 'sonner';

import { LoadingProvider } from '@/components/providers/loading-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { PageWrapper } from '@/components/ui/page-wrapper';

import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Σύστημα Διαχείρισης',
  description: 'Σύστημα διαχείρισης κωδικών και πωλήσεων',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: 'dark light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="el" suppressHydrationWarning>
      <head>
        <link href="/manifest.json" rel="manifest" />
        <meta content="#000000" name="theme-color" />
        <meta
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes"
          name="viewport"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          <LoadingProvider>
            <PageWrapper variant="root">{children}</PageWrapper>
            <Toaster position="top-right" />
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
